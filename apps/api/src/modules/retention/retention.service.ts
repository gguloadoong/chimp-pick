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

// Intl.DateTimeFormat을 사용해 KST 기준 YYYY-MM-DD 문자열을 안정적으로 생성
// toLocaleString('ko-KR') 파싱은 런타임/OS에 따라 포맷이 달라져 신뢰할 수 없음
function getKstDateString(): string {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to format KST date string');
  }

  return `${year}-${month}-${day}`;
}

// Date 객체를 KST 기준 YYYY-MM-DD 문자열로 변환
// toISOString()은 UTC 기준이므로 KST 자정 전후에 날짜가 달라짐
function toKstDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to format KST date string');
  }

  return `${year}-${month}-${day}`;
}

function getStreakReward(streak: number): number {
  const milestones = [30, 14, 7, 3, 1];
  for (const m of milestones) {
    if (streak >= m) return STREAK_REWARDS[m];
  }
  return STREAK_REWARDS[1];
}

// KST 기준으로 어제 날짜를 계산해 비교
// new Date(YYYY-MM-DD)는 UTC 자정으로 파싱되므로 직접 연산하지 않고
// KST todayStr에서 하루 전 날짜를 구함
function isYesterday(dateStr: string, todayStr: string): boolean {
  const [y, m, d] = todayStr.split('-').map(Number);
  const todayKst = new Date(y, m - 1, d); // 로컬 자정 (비교용 순수 날짜 연산)
  const yesterdayKst = new Date(todayKst);
  yesterdayKst.setDate(yesterdayKst.getDate() - 1);
  const yy = yesterdayKst.getFullYear();
  const mm = String(yesterdayKst.getMonth() + 1).padStart(2, '0');
  const dd = String(yesterdayKst.getDate()).padStart(2, '0');
  return dateStr === `${yy}-${mm}-${dd}`;
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

    // 중복 체크 + 스트릭 업데이트를 단일 트랜잭션 안에서 처리
    // 트랜잭션 밖에서 조회 후 판단하면 동시 요청 시 중복 보상 가능
    return this.prisma.$transaction(async (tx) => {
      const streak = await tx.dailyStreak.findUnique({
        where: { userId },
      });

      if (streak && streak.lastCheckinAt) {
        const lastCheckinDate = toKstDateString(streak.lastCheckinAt);
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
        const lastCheckinDate = toKstDateString(streak.lastCheckinAt);
        if (isYesterday(lastCheckinDate, todayStr)) {
          newStreak = streak.currentStreak + 1;
        }
      }

      const newMaxStreak = Math.max(newStreak, streak?.maxStreak ?? 0);
      const reward = getStreakReward(newStreak);

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

      // increment를 사용해 동시 트랜잭션 간 잔액 갱신 경쟁 조건 방지
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { freeCoins: { increment: reward } },
        select: { freeCoins: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          coinType: 'FREE',
          amount: reward,
          balanceAfter: updatedUser.freeCoins,
          description: `스트릭 ${newStreak}일 체크인 보너스`,
        },
      });

      return {
        streak: newStreak,
        maxStreak: newMaxStreak,
        reward,
        isAlreadyCheckedIn: false,
      };
    });
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

    // isCompleted 확인과 완료 처리를 단일 트랜잭션 안에서 수행
    // 트랜잭션 밖에서 조회 후 완료 처리하면 동시 요청 시 중복 보상 가능
    return this.prisma.$transaction(async (tx) => {
      const mission = await tx.dailyMission.findUnique({
        where: { userId_date_type: { userId, date: todayStr, type } },
      });

      if (mission?.isCompleted) {
        return { completed: false, reward: 0, alreadyCompleted: true };
      }

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

      // increment를 사용해 동시 트랜잭션 간 잔액 갱신 경쟁 조건 방지
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { freeCoins: { increment: rewardAmount } },
        select: { freeCoins: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          coinType: 'FREE',
          amount: rewardAmount,
          balanceAfter: updatedUser.freeCoins,
          description: `일일 미션 완료: ${type}`,
        },
      });

      return { completed: true, reward: rewardAmount, alreadyCompleted: false };
    });
  }

  async getStreakInfo(userId: string): Promise<DailyStreak | null> {
    return this.prisma.dailyStreak.findUnique({ where: { userId } });
  }
}
