import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { GameModule } from './modules/game/game.module';
import { PriceModule } from './modules/price/price.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { RewardModule } from './modules/reward/reward.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RetentionModule } from './modules/retention/retention.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    GameModule,
    PriceModule,
    RankingModule,
    RewardModule,
    PaymentsModule,
    RetentionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
