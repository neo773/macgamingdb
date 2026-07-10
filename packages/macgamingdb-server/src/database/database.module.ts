import { Global, Module } from '@nestjs/common';
import { createDrizzleClient } from './drizzle';
import { DRIZZLE_CLIENT } from './constants/drizzle-client.constant';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      useFactory: () => createDrizzleClient(),
    },
  ],
  exports: [DRIZZLE_CLIENT],
})
export class DatabaseModule {}
