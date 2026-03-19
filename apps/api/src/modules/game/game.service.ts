import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  predictions,
  findUser,
  findUserStats,
  transactions,
  generateId,
  Prediction,
  PredictionDirection,
  PredictionTimeframe,
} from '../../mock/data';
import { getCurrentPriceValue } from '../../mock/price-generator';

const TIMEFRAME_MS: Record<PredictionTimeframe, number> = {
  '1m': 10_000,
  '5m': 30_000,
  '1h': 60_000,
  '1d': 120_000,
};

@Injectable()
export class GameService {
  createPrediction(
    userId: string,
    body: {
      symbol: string;
      direction: PredictionDirection;
      timeframe: PredictionTimeframe;
      betAmount: number;
    },
  ): Prediction {
    const user = findUser(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (user.bananaCoins < body.betAmount) {
      throw new BadRequestException('바나나코인이 부족합니다.');
    }

    const activePrediction = this.getActivePrediction(userId);
    if (activePrediction) {
      throw new BadRequestException('이미 진행 중인 예측이 있습니다.');
    }

    const entryPrice = getCurrentPriceValue(body.symbol);
    if (!entryPrice) {
      throw new BadRequestException('지원하지 않는 종목입니다.');
    }

    user.bananaCoins -= body.betAmount;

    transactions.push({
      id: generateId(),
      userId,
      type: 'BET',
      amount: -body.betAmount,
      description: `${body.symbol} ${body.direction} 예측 베팅`,
      createdAt: new Date().toISOString(),
    });

    const delayMs = TIMEFRAME_MS[body.timeframe] ?? 10_000;
    const expiresAt = new Date(Date.now() + delayMs).toISOString();

    const prediction: Prediction = {
      id: generateId(),
      userId,
      symbol: body.symbol,
      direction: body.direction,
      timeframe: body.timeframe,
      betAmount: body.betAmount,
      entryPrice,
      exitPrice: null,
      result: 'PENDING',
      reward: 0,
      createdAt: new Date().toISOString(),
      expiresAt,
      resolvedAt: null,
    };

    predictions.push(prediction);

    setTimeout(() => {
      this.resolvePrediction(prediction.id);
    }, delayMs);

    return prediction;
  }

  resolvePrediction(predictionId: string): Prediction | null {
    const prediction = predictions.find((p) => p.id === predictionId);
    if (!prediction || prediction.result !== 'PENDING') return null;

    const exitPrice = getCurrentPriceValue(prediction.symbol);
    prediction.exitPrice = exitPrice;
    prediction.resolvedAt = new Date().toISOString();

    const isUp = exitPrice >= prediction.entryPrice;
    const won =
      (prediction.direction === 'UP' && isUp) ||
      (prediction.direction === 'DOWN' && !isUp);

    prediction.result = won ? 'WIN' : 'LOSE';

    const user = findUser(prediction.userId);
    const stats = findUserStats(prediction.userId);

    stats.totalPredictions += 1;
    stats.totalBet += prediction.betAmount;

    if (won) {
      const reward = Math.floor(prediction.betAmount * 1.8);
      prediction.reward = reward;

      if (user) user.bananaCoins += reward;

      stats.wins += 1;
      stats.currentStreak =
        stats.currentStreak >= 0 ? stats.currentStreak + 1 : 1;
      stats.profitLoss += reward - prediction.betAmount;

      transactions.push({
        id: generateId(),
        userId: prediction.userId,
        type: 'WIN',
        amount: reward,
        description: `${prediction.symbol} ${prediction.direction} 예측 적중 보상`,
        createdAt: new Date().toISOString(),
      });
    } else {
      prediction.reward = 0;
      stats.losses += 1;
      stats.currentStreak =
        stats.currentStreak <= 0 ? stats.currentStreak - 1 : -1;
      stats.profitLoss -= prediction.betAmount;
    }

    if (Math.abs(stats.currentStreak) > stats.maxStreak) {
      stats.maxStreak = Math.abs(stats.currentStreak);
    }

    stats.winRate =
      stats.totalPredictions > 0
        ? parseFloat(((stats.wins / stats.totalPredictions) * 100).toFixed(2))
        : 0;

    return prediction;
  }

  getUserPredictions(
    userId: string,
    page: number,
    limit: number,
  ): { items: Prediction[]; total: number; page: number; limit: number } {
    const userPredictions = predictions
      .filter((p) => p.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const total = userPredictions.length;
    const items = userPredictions.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit };
  }

  getActivePrediction(userId: string): Prediction | null {
    return (
      predictions.find((p) => p.userId === userId && p.result === 'PENDING') ??
      null
    );
  }
}
