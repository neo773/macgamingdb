import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { LibraryService } from './services/library.service';
import { LibraryRouter } from './routers/library.router';

@Module({
  providers: [LibraryService, LibraryRouter, AuthMiddleware],
})
export class LibraryModule {}
