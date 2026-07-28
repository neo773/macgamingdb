import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { LibraryService } from './services/library.service';
import { LibraryRouter } from './routers/library.router';
import { SteamWebApiService } from './drivers/steam/services/steam-web-api.service';
import { SteamLibrarySyncService } from './drivers/steam/services/steam-library-sync.service';
import { SteamOpenIdService } from './drivers/steam/services/steam-openid.service';
import { SteamConnectionController } from './controllers/steam-connection.controller';

@Module({
  controllers: [SteamConnectionController],
  providers: [
    LibraryService,
    LibraryRouter,
    AuthMiddleware,
    SteamWebApiService,
    SteamLibrarySyncService,
    SteamOpenIdService,
  ],
})
export class LibraryModule {}
