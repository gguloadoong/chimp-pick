import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../../guards/auth.guard';
import type { AuthenticatedRequest } from '../../guards/auth.guard';

function buildResponse(data: unknown) {
  return {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() },
  };
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Apple StoreKit 2 서버 알림 수신 */
  @Post('iap/apple')
  @HttpCode(HttpStatus.OK)
  async handleAppleNotification(
    @Body() body: unknown,
    @Headers('x-apple-signature') signature: string,
  ) {
    await this.paymentsService.processAppleNotification(body, signature);
    return { received: true };
  }

  /** Google Play Billing RTDN 수신 */
  @Post('iap/google')
  @HttpCode(HttpStatus.OK)
  async handleGoogleNotification(@Body() body: unknown) {
    await this.paymentsService.processGoogleNotification(body);
    return { received: true };
  }

  /** 스토어 상품 목록 조회 */
  @Get('iap/products')
  async getProducts() {
    const products = await this.paymentsService.getActiveProducts();
    return buildResponse(products);
  }

  /** 내 코인 잔액 조회 (FREE / PAID 분리) */
  @Get('coins')
  @UseGuards(AuthGuard)
  async getCoinBalance(@Req() req: AuthenticatedRequest) {
    const balance = await this.paymentsService.getCoinBalance(req.user.id);
    return buildResponse(balance);
  }
}
