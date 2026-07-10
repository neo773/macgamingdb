import { Module } from '@nestjs/common';
import { GgDealsApiClientService } from './drivers/ggdeals/services/ggdeals-api-client.service';

@Module({
  providers: [GgDealsApiClientService],
  exports: [GgDealsApiClientService],
})
export class PricingModule {}
