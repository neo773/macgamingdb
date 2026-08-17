import { Test } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import { AppRouterHost } from 'nestjs-trpc';
import { type AppRouter } from '../../src/@generated/server';
import { AppModule } from '../../src/app.module';
import { DRIZZLE_CLIENT } from '../../src/database/constants/drizzle-client.constant';
import { type DrizzleDB } from '../../src/database/drizzle';
import { games, macConfigs, users } from '../../src/database/schema';
import { AuthMiddleware } from '../../src/engine/api/trpc/auth.middleware';
import { PageRevalidationService } from '../../src/engine/core-modules/page-revalidation/page-revalidation.service';
import { MODERATION_LLM } from '../../src/modules/report/constants/moderation-llm.constant';
import { DiscordMessageService } from '../../src/modules/report/drivers/discord/services/discord-message.service';
import { createTestGame } from '../factories/create-test-game.factory';
import { createTestMacConfig } from '../factories/create-test-mac-config.factory';
import { createTestUser } from '../factories/create-test-user.factory';
import {
  createFakeDiscordMessageService,
  type FakeDiscordMessageService,
} from '../fakes/fake-discord-message-service';
import {
  createFakeModerationLlm,
  type FakeModerationLlm,
} from '../fakes/fake-moderation-llm';
import { createTestDatabase } from './create-test-database.util';

type SignedInUser = { id: string } | null;

export type TestApp = {
  db: DrizzleDB;
  caller: ReturnType<AppRouter['createCaller']>;
  moderationLlm: FakeModerationLlm;
  discord: FakeDiscordMessageService;
  signInAs: (userId: string | null) => void;
  close: () => Promise<void>;
};

export const createTestApp = async (): Promise<TestApp> => {
  const { db, close: closeDatabase } = await createTestDatabase();
  const moderationLlm = createFakeModerationLlm();
  const discord = createFakeDiscordMessageService();

  let signedInUser: SignedInUser = { id: createTestUser().id };

  const authMiddleware = {
    use: async (opts: {
      next: (options: { ctx: unknown }) => Promise<unknown>;
    }) => {
      if (!signedInUser) {
        const { TRPCError } = await import('@trpc/server');
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      return opts.next({ ctx: { user: { user: { id: signedInUser.id } } } });
    },
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DRIZZLE_CLIENT)
    .useValue(db)
    .overrideProvider(AuthMiddleware)
    .useValue(authMiddleware)
    .overrideProvider(MODERATION_LLM)
    .useValue(moderationLlm)
    .overrideProvider(DiscordMessageService)
    .useValue(discord)
    .overrideProvider(PageRevalidationService)
    .useValue({ revalidatePaths: async () => undefined })
    .compile();

  const app: INestApplication = moduleRef.createNestApplication({
    logger: false,
  });
  await app.init();

  const appRouter = app.get(AppRouterHost).appRouter as unknown as AppRouter;
  const caller = appRouter.createCaller({});

  return {
    db,
    caller,
    moderationLlm,
    discord,
    signInAs: (userId: string | null) => {
      signedInUser = userId === null ? null : { id: userId };
    },
    close: async () => {
      await app.close();
      closeDatabase();
    },
  };
};

export const seedBaseline = async (db: DrizzleDB) => {
  const user = createTestUser();
  const game = createTestGame();
  const macConfig = createTestMacConfig();

  await db.insert(users).values(user);
  await db.insert(games).values(game);
  await db
    .insert(macConfigs)
    .values({ ...macConfig, metadata: JSON.stringify(macConfig.metadata) });

  return { user, game, macConfig };
};
