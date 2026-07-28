import 'reflect-metadata';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppRouterHost } from 'nestjs-trpc';
import { createOpenApiExpressMiddleware } from 'trpc-to-openapi';
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
  const server = express();

  const restRouter = express.Router();
  server.use('/rest', restRouter);

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    rawBody: true,
  });
  await app.init();

  const restHandler = createOpenApiExpressMiddleware({
    router: app.get(AppRouterHost).appRouter,
    createContext: ({ req, res }) => ({ req, res }),
  });

  restRouter.use((request, response, next) => {
    restHandler(request, response).catch(next);
  });

  const port = process.env.SERVER_PORT ?? 4000;
  await app.listen(port);
};

void bootstrap();
