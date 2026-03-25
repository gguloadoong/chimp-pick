import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RetentionService } from '../retention/retention.service';
import { Prediction } from '@prisma/client';

// Timeframe to milliseconds (Sprint 1: short for testing)
const TIMEFRAME_MS: Record<string, number> = {
  '1m': 10_000,
  '5m': 30_000,
  '1h': 60_000,
  '1d': 120_000,
};

const VALID_TIMEFRAMES = ['1m', '5m', '1h', '1d'];
const VALID_DIRECTIONS = ['UP', 'DOWN'];
const WIN_MULTIPLIER = 1.9; // per agreements.md X7

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly retentionService: RetentionService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.reschedulePendingPredictions();
  }

  private async reschedulePendingPredictions(): Promise<void> {
    const pending = await this.prisma.prediction.findMany({
      where: { result: 'PENDING' },
      select: { id: true, expiresAt: true },
    });

    const now = Date.now();
    for (const [index, prediction] of pending.entries()) {
      const remainingMs = prediction.expiresAt.getTime() - now;
      // 이미 만료된 것도 처리, 동시 처리로 인한 DB 부하 분산을 위해 50ms 간격
      const delay = Math.max(remainingMs, 0) + index * 50;
      setTimeout(() => {
        void this.resolvePrediction(prediction.id);
      }, delay);
    }

    if (pending.length > 0) {
      this.logger.log(`${pending.length}개의 PENDING 예측 재스케줄링 완료`);
    }
  }

  async createPrediction(
    userId: string,
    body: { symbol: string; direction: string; timeframe: string; betAmount: number },
  ): Promise<Prediction> {
    // Validate direction and timeframe
    if (!VALID_DIRECTIONS.includes(body.direction)) {
      throw new BadRequestException('예측 방향은 UP 또는 DOWN이어야 합니다.');
    }
    if (!VALID_TIMEFRAMES.includes(body.timeframe)) {
      throw new BadRequestException('지원하지 않는 타임프레임입니다.');
    }
    if (!Number.isInteger(body.betAmount) || body.betAmount < 10) {
      throw new BadRequestException('베팅 금액은 10 이상의 정수여야 합니다.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    if (user.bananaCoins < body.betAmount) {
      throw new BadRequestException('바나나코인이 부족합니다. (INSUFFICIENT_COINS)');
    }

    // Check for active prediction on same symbol
    const activePrediction = await this.prisma.prediction.findFirst({
      where: { userId, symbol: body.symbol, result: 'PENDING' },
    });
    if (activePrediction) {
      throw new BadRequestException('해당 종목에 이미 진행 중인 예측이 있습니다. (DUPLICATE_PREDICTION)');
    }

    // Entry price: use mock for Sprint 1 (Upbit integration in #60 not yet merged)
    const { getCurrentPriceValue } = await import('../../mock/price-generator.js');
    const entryPrice = getCurrentPriceValue(body.symbol);
    if (!entryPrice) {
      throw new BadRequestException('지원하지 않는 종목입니다.');
    }

    const delayMs = TIMEFRAME_MS[body.timeframe] ?? 10_000;
    const expiresAt = new Date(Date.now() + delayMs);

    // Atomic: create prediction + deduct coins + record transaction
    const prediction = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { bananaCoins: { decrement: body.betAmount } },
      });

      const newPrediction = await tx.prediction.create({
        data: {
          userId,
          symbol: body.symbol,
          direction: body.direction,
          timeframe: body.timeframe,
          betAmount: body.betAmount,
          entryPrice,
          result: 'PENDING',
          expiresAt,
        },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'BET',
          amount: -body.betAmount,
          balanceAfter: updatedUser.bananaCoins,
          predictionId: newPrediction.id,
          description: `${body.symbol} ${body.direction} 예측 베팅`,
        },
      });

      return newPrediction;
    });

    // Schedule resolution (Sprint 1: setTimeout; Sprint 2: BullMQ)
    setTimeout(() => {
      void this.resolvePrediction(prediction.id);
    }, delayMs);

    return prediction;
  }

  async resolvePrediction(predictionId: string): Promise<void> {
    const prediction = await this.prisma.prediction.findUnique({
      where: { id: predictionId },
    });
    if (!prediction || prediction.result !== 'PENDING') return;

    // Use mock exit price for Sprint 1
    const { getCurrentPriceValue } = await import('../../mock/price-generator.js');
    const exitPrice = getCurrentPriceValue(prediction.symbol) ?? prediction.entryPrice;

    const isUp = exitPrice >= prediction.entryPrice;
    const won =
      (prediction.direction === 'UP' && isUp) ||
      (prediction.direction === 'DOWN' && !isUp);

    const result = won ? 'WIN' : 'LOSE';
    const reward = won ? Math.floor(prediction.betAmount * WIN_MULTIPLIER) : 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.prediction.update({
        where: { id: predictionId },
        data: { exitPrice, result, reward, resolvedAt: new Date() },
      });

      if (won) {
        const updatedUser = await tx.user.update({
          where: { id: prediction.userId },
          data: { bananaCoins: { increment: reward } },
        });
        await tx.transaction.create({
          data: {
            userId: prediction.userId,
            type: 'WIN',
            amount: reward,
            balanceAfter: updatedUser.bananaCoins,
            predictionId,
            description: `${prediction.symbol} ${prediction.direction} 예측 적중 보상`,
          },
        });
      }

      const stats = await tx.userStats.findUnique({
        where: { userId: prediction.userId },
      });

      if (stats) {
        const newWins = won ? stats.wins + 1 : stats.wins;
        const newLosses = won ? stats.losses : stats.losses + 1;
        const newTotal = stats.totalPredictions + 1;
        const newStreak = won
          ? stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1
          : stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;
        const newMaxStreak = Math.max(stats.maxStreak, Math.abs(newStreak));

        await tx.userStats.update({
          where: { userId: prediction.userId },
          data: {
            totalPredictions: newTotal,
            wins: newWins,
            losses: newLosses,
            winRate: newTotal > 0 ? Math.round((newWins / newTotal) * 100) / 100 : 0,
            currentStreak: newStreak,
            maxStreak: newMaxStreak,
          },
        });
      }
    });

    // 리텐션 미션 자동 트리거 — 미션별 독립 try/catch로 격리
    // FIRST_PREDICT 실패가 THREE_PREDICTS 평가를 막지 않도록 분리
    try {
      await this.retentionService.completeMission(prediction.userId, 'FIRST_PREDICT');
    } catch (missionErr) {
      this.logger.warn(
        `리텐션 미션 업데이트 실패 (FIRST_PREDICT, predictionId=${predictionId}): ${missionErr instanceof Error ? missionErr.message : String(missionErr)}`,
        missionErr instanceof Error ? missionErr.stack : undefined,
      );
    }

    try {
      // KST 기준 당일 완료 예측 건수 확인 — 서버 TZ 무관하게 동작
      const kstDateStr = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()).replace(/\. /g, '-').replace('.', '');
      const todayStartKst = new Date(`${kstDateStr}T00:00:00+09:00`);
      const tomorrowStartKst = new Date(todayStartKst.getTime() + 24 * 60 * 60 * 1000);

      const todayCount = await this.prisma.prediction.count({
        where: {
          userId: prediction.userId,
          result: { in: ['WIN', 'LOSE'] },
          resolvedAt: { gte: todayStartKst, lt: tomorrowStartKst },
        },
      });
      if (todayCount >= 3) {
        await this.retentionService.completeMission(prediction.userId, 'THREE_PREDICTS');
      }
    } catch (missionErr) {
      this.logger.warn(
        `리텐션 미션 업데이트 실패 (THREE_PREDICTS, predictionId=${predictionId}): ${missionErr instanceof Error ? missionErr.message : String(missionErr)}`,
        missionErr instanceof Error ? missionErr.stack : undefined,
      );
    }
  }

  async getUserPredictions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Prediction[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.prediction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prediction.count({ where: { userId } }),
    ]);
    return { items, total, page, limit };
  }

  async getActivePrediction(userId: string): Promise<Prediction | null> {
    return this.prisma.prediction.findFirst({
      where: { userId, result: 'PENDING' },
    });
  }

  async getPrediction(userId: string, predictionId: string): Promise<Prediction | null> {
    return this.prisma.prediction.findFirst({
      where: { id: predictionId, userId },
    });
  }
}
