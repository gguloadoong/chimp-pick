import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { DailyMission, DailyStreak } from '@prisma/client';
import type { MissionType } from './dto/checkin.dto';

const MISSION_REWARDS: Record<MissionType, number> = {
  FIRST_PREDICT: 5,
  THREE_PREDICTS: 10,
  SHARE: 15,
};

const STREAK_REWARDS: Record<number, number> = {
  1: 10,
  3: 15,
  7: 25,
  14: 40,
  30: 60,
};

function getKstDateString(): string {
  return new Date()
    .toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    .split(' ')[0]
    .replace(/\./g, '-')
    .replace(/-$/, '')
    .split('-')
    .map((v) => v.trim().padStart(2, '0'))
    .join('-');
}

function getStreakReward(streak: number): number {
  const milestones = [30, 14, 7, 3, 1];
  for (const m of milestones) {
    if (streak >= m) return STREAK_REWARDS[m];
  }
  return STREAK_REWARDS[1];
}

function isYesterday(dateStr: string, todayStr: string): boolean {
  const today = new Date(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

function isToday(dateStr: string, todayStr: string): boolean {
  return dateStr === todayStr;
}

@Injectable()
export class RetentionService {
  constructor(private readonly prisma: PrismaService) {}

  async checkin(userId: string): Promise<{
    streak: number;
    maxStreak: number;
    reward: number;
    isAlreadyCheckedIn: boolean;
  }> {
    const todayStr = getKstDateString();

    const streak = await this.prisma.dailyStreak.findUnique({
      where: { userId },
    });

    if (streak && streak.lastCheckinAt) {
      const lastCheckinDate = streak.lastCheckinAt.toISOString().slice(0, 10);
      if (isToday(lastCheckinDate, todayStr)) {
        return {
          streak: streak.currentStreak,
          maxStreak: streak.maxStreak,
          reward: 0,
          isAlreadyCheckedIn: true,
        };
      }
    }

    let newStreak = 1;
    if (streak && streak.lastCheckinAt) {
      const lastCheckinDate = streak.lastCheckinAt.toISOString().slice(0, 10);
      if (isYesterday(lastCheckinDate, todayStr)) {
        newStreak = streak.currentStreak + 1;
      }
    }

    const newMaxStreak = Math.max(newStreak, streak?.maxStreak ?? 0);
    const reward = getStreakReward(newStreak);

    await this.prisma.$transaction(async (tx) => {
      await tx.dailyStreak.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak: newStreak,
          maxStreak: newMaxStreak,
          lastCheckinAt: new Date(),
        },
        update: {
          currentStreak: newStreak,
          maxStreak: newMaxStreak,
          lastCheckinAt: new Date(),
        },
      });

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const newFreeCoins = user.freeCoins + reward;

      await tx.user.update({
        where: { id: userId },
        data: { freeCoins: newFreeCoins },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          coinType: 'FREE',
          amount: reward,
          balanceAfter: newFreeCoins,
          description: `스트릭 ${newStreak}일 체크인 보너스`,
        },
      });
    });

    return {
      streak: newStreak,
      maxStreak: newMaxStreak,
      reward,
      isAlreadyCheckedIn: false,
    };
  }

  async getTodayMissions(userId: string): Promise<DailyMission[]> {
    const todayStr = getKstDateString();
    const types: MissionType[] = ['FIRST_PREDICT', 'THREE_PREDICTS', 'SHARE'];

    const existing = await this.prisma.dailyMission.findMany({
      where: { userId, date: todayStr },
    });

    const existingTypes = new Set(existing.map((m) => m.type));
    const missing = types.filter((t) => !existingTypes.has(t));

    if (missing.length > 0) {
      await this.prisma.dailyMission.createMany({
        data: missing.map((type) => ({
          userId,
          date: todayStr,
          type,
          reward: MISSION_REWARDS[type],
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.dailyMission.findMany({
      where: { userId, date: todayStr },
      orderBy: { createdAt: 'asc' },
    });
  }

  async completeMission(
    userId: string,
    type: MissionType,
  ): Promise<{
    completed: boolean;
    reward: number;
    alreadyCompleted: boolean;
  }> {
    const todayStr = getKstDateString();
    const rewardAmount = MISSION_REWARDS[type];

    const mission = await this.prisma.dailyMission.findUnique({
      where: { userId_date_type: { userId, date: todayStr, type } },
    });

    if (mission?.isCompleted) {
      return { completed: false, reward: 0, alreadyCompleted: true };
    }

    await this.prisma.$transaction(async (tx) => {
      if (mission) {
        await tx.dailyMission.update({
          where: { userId_date_type: { userId, date: todayStr, type } },
          data: { isCompleted: true, completedAt: new Date() },
        });
      } else {
        await tx.dailyMission.create({
          data: {
            userId,
            date: todayStr,
            type,
            isCompleted: true,
            completedAt: new Date(),
            reward: rewardAmount,
          },
        });
      }

      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const newFreeCoins = user.freeCoins + rewardAmount;

      await tx.user.update({
        where: { id: userId },
        data: { freeCoins: newFreeCoins },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          coinType: 'FREE',
          amount: rewardAmount,
          balanceAfter: newFreeCoins,
          description: `일일 미션 완료: ${type}`,
        },
      });
    });

    return { completed: true, reward: rewardAmount, alreadyCompleted: false };
  }

  async getStreakInfo(userId: string): Promise<DailyStreak | null> {
    return this.prisma.dailyStreak.findUnique({ where: { userId } });
  }
}
