import { Module } from '@nestjs/common';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';
import { UpbitService } from './upbit.service';
import { GatewayModule } from '../../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [PriceController],
  providers: [PriceService, UpbitService],
  exports: [PriceService, UpbitService],
})
export class PriceModule {}
