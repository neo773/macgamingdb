import { Global, Module } from '@nestjs/common';
import { PageRevalidationService } from './page-revalidation.service';

@Global()
@Module({
  providers: [PageRevalidationService],
  exports: [PageRevalidationService],
})
export class PageRevalidationModule {}
