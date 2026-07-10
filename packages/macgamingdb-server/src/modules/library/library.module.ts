import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { LibraryService } from './services/library.service';
import { LibraryRouter } from './routers/library.router';
import { SteamWebApiService } from './drivers/steam/services/steam-web-api.service';
import { SteamLibrarySyncService } from './drivers/steam/services/steam-library-sync.service';
import { SteamOpenIdService } from './drivers/steam/services/steam-openid.service';

@Module({
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
