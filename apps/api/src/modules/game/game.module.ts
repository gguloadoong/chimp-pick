import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { AuthModule } from '../auth/auth.module';
import { RetentionModule } from '../retention/retention.module';

@Module({
  imports: [AuthModule, RetentionModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
