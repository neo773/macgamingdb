import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  REPORT_SUBMITTED_EVENT,
  type ReportSubmittedEvent,
} from '../events/report-submitted.event';
import { ReportService } from '../services/report.service';

@Injectable()
export class ReportSubmittedListener {
  constructor(private readonly reportService: ReportService) {}

  @OnEvent(REPORT_SUBMITTED_EVENT)
  async handleReportSubmitted(event: ReportSubmittedEvent): Promise<void> {
    await this.reportService.handleReportSubmitted(event);
  }
}
