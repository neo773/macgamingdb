import { Module } from '@nestjs/common';
import { ContributorService } from './services/contributor.service';
import { ContributorRouter } from './routers/contributor.router';

@Module({
  providers: [ContributorService, ContributorRouter],
})
export class ContributorModule {}
