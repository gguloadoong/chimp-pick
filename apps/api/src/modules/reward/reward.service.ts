import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  findUser,
  transactions,
  generateId,
  Transaction,
} from '../../mock/data';

const DAILY_BONUS = 10;

@Injectable()
export class RewardService {
  claimDailyBonus(userId: string): { bonus: number; totalCoins: number } {
    const user = findUser(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    if (user.lastDailyBonus) {
      const lastBonus = new Date(user.lastDailyBonus);
      const now = new Date();
      const diffMs = now.getTime() - lastBonus.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 24) {
        const nextAvailableMs = 24 * 60 * 60 * 1000 - diffMs;
        const nextHours = Math.ceil(nextAvailableMs / (1000 * 60 * 60));
        throw new BadRequestException(
          `일일 보너스는 24시간마다 받을 수 있습니다. ${nextHours}시간 후 다시 시도해 주세요.`,
        );
      }
    }

    user.bananaCoins += DAILY_BONUS;
    user.lastDailyBonus = new Date().toISOString();

    transactions.push({
      id: generateId(),
      userId,
      type: 'DAILY_BONUS',
      amount: DAILY_BONUS,
      description: '일일 출석 보너스',
      createdAt: new Date().toISOString(),
    });

    return { bonus: DAILY_BONUS, totalCoins: user.bananaCoins };
  }

  getTransactions(
    userId: string,
    page: number,
    limit: number,
  ): { items: Transaction[]; total: number; page: number; limit: number } {
    const userTxs = transactions
      .filter((t) => t.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const total = userTxs.length;
    const items = userTxs.slice((page - 1) * limit, page * limit);

    return { items, total, page, limit };
  }
}
