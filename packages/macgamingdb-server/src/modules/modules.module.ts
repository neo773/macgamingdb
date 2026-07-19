import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { ReviewModule } from './review/review.module';
import { ContributorModule } from './contributor/contributor.module';
import { LibraryModule } from './library/library.module';
import { TrafficModule } from './traffic/traffic.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    GameModule,
    ReviewModule,
    ContributorModule,
    LibraryModule,
    TrafficModule,
    ReportModule,
  ],
})
export class ModulesModule {}
