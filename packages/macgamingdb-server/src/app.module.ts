import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TRPCModule } from 'nestjs-trpc';
import superjson from 'superjson';
import { DatabaseModule } from './database/database.module';
import { AppContext } from './engine/api/trpc/app.context';
import { ExceptionMappingMiddleware } from './engine/api/trpc/exception-mapping.middleware';
import { PageRevalidationModule } from './engine/core-modules/page-revalidation/page-revalidation.module';
import { FileStorageModule } from './engine/core-modules/file-storage/file-storage.module';
import { ModulesModule } from './modules/modules.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    DatabaseModule,
    PageRevalidationModule,
    FileStorageModule,
    TRPCModule.forRoot({
      transformer: superjson,
      basePath: '/trpc',
      context: AppContext,
      globalMiddlewares: [ExceptionMappingMiddleware],
    }),
    ModulesModule,
  ],
  providers: [AppContext, ExceptionMappingMiddleware],
})
export class AppModule {}
