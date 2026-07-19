import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  REVIEW_CREATED_EVENT,
  type ReviewCreatedEvent,
} from '../../review/events/review-created.event';
import { ReportService } from '../services/report.service';

@Injectable()
export class ReviewCreatedListener {
  constructor(private readonly reportService: ReportService) {}

  @OnEvent(REVIEW_CREATED_EVENT)
  async handleReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    await this.reportService.screenNewReview({ reviewId: event.reviewId });
  }
}
