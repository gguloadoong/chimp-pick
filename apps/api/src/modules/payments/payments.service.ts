import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Apple StoreKit 2 서버 알림 처리 */
  async processAppleNotification(body: unknown, signature: string): Promise<void> {
    // TODO: JWS 서명 검증 (Apple 루트 CA) → Sprint 2 구현
    // TODO: notificationType 파싱 → PURCHASED / REFUND 분기
    this.logger.log('Apple IAP notification received', { signature: signature?.slice(0, 20) });
  }

  /** Google Play Billing RTDN 처리 */
  async processGoogleNotification(body: unknown): Promise<void> {
    // TODO: Pub/Sub 메시지 base64 디코드 → purchaseToken 검증 → Sprint 2 구현
    this.logger.log('Google IAP notification received');
  }

  /** 활성 상품 목록 조회 */
  async getActiveProducts() {
    return this.prisma.iapProduct.findMany({
      where: { isActive: true },
      select: { productId: true, name: true, coinAmount: true, priceKrw: true, platform: true },
      orderBy: { priceKrw: 'asc' },
    });
  }

  /** 코인 잔액 조회 (FREE / PAID 분리) */
  async getCoinBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { freeCoins: true, paidCoins: true },
    });
    if (!user) throw new BadRequestException('USER_NOT_FOUND');
    return { freeCoins: user.freeCoins, paidCoins: user.paidCoins };
  }

  /**
   * 예측 참여 시 FREE 코인 차감.
   * PAID 코인 사용 시도 → INSUFFICIENT_FREE_COINS 에러.
   */
  async spendFreeCoins(userId: string, amount: number, predictionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { freeCoins: true } });
      if (!user || user.freeCoins < amount) {
        throw new BadRequestException('INSUFFICIENT_FREE_COINS');
      }
      await tx.user.update({
        where: { id: userId },
        data: { freeCoins: { decrement: amount } },
      });
      await tx.transaction.create({
        data: {
          userId,
          type: 'PREDICTION_SPEND',
          coinType: 'FREE',
          amount: -amount,
          balanceAfter: user.freeCoins - amount,
          predictionId,
          description: '예측 참여',
        },
      });
    });
  }

  /**
   * 예측 적중 시 FREE 코인 보상 지급.
   */
  async rewardFreeCoins(userId: string, amount: number, predictionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { freeCoins: { increment: amount } },
        select: { freeCoins: true },
      });
      await tx.transaction.create({
        data: {
          userId,
          type: 'PREDICTION_REWARD',
          coinType: 'FREE',
          amount,
          balanceAfter: user.freeCoins,
          predictionId,
          description: '예측 적중 보상',
        },
      });
    });
  }

  /**
   * 일일 출석 보상 (FREE 코인).
   */
  async grantDailyBonus(userId: string, amount: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { freeCoins: { increment: amount } },
        select: { freeCoins: true },
      });
      await tx.transaction.create({
        data: {
          userId,
          type: 'DAILY_BONUS',
          coinType: 'FREE',
          amount,
          balanceAfter: user.freeCoins,
          description: '일일 출석 보상',
        },
      });
    });
  }
}
