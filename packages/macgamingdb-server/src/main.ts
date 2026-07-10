import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppRouterHost } from 'nestjs-trpc';
import { createOpenApiExpressMiddleware } from 'trpc-to-openapi';
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const server = express();

  let restHandler:
    | ((request: express.Request, response: express.Response) => Promise<void>)
    | undefined;

  server.use('/rest', (request, response, next) => {
    if (!restHandler) {
      next();
      return;
    }
    restHandler(request, response).catch(next);
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();

  const appRouter = app.get(AppRouterHost).appRouter;

  restHandler = createOpenApiExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => ({ req, res }),
  });

  const port = process.env.SERVER_PORT ?? 4000;
  await app.listen(port);
};

void bootstrap();
