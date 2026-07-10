import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppRouterHost } from 'nestjs-trpc';
import { generateOpenApiDocument } from 'trpc-to-openapi';
import { AppModule } from '../../app.module';

export const writeOpenApiDocumentFile = async ({
  outputPath,
}: {
  outputPath: string;
}): Promise<number> => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(express()),
    { logger: false },
  );
  await app.init();

  const appRouter = app.get(AppRouterHost).appRouter;

  const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'MacGamingDB API',
    description: 'REST API for MacGamingDB — Mac gaming performance reports.',
    version: '1.0.0',
    baseUrl: 'https://macgamingdb.app/api/rest',
    tags: ['games', 'reviews', 'mac-configs', 'contributors'],
  });

  writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

  await app.close();

  return Object.keys(openApiDocument.paths ?? {}).length;
};
