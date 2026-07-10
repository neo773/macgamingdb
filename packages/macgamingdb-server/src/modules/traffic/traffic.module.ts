import { Module } from '@nestjs/common';
import { TrafficService } from './services/traffic.service';
import { TrafficRouter } from './routers/traffic.router';

@Module({
  providers: [TrafficService, TrafficRouter],
})
export class TrafficModule {}
