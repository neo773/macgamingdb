/**
 * Generates openapi.json from the tRPC router's OpenAPI-annotated procedures.
 *
 * Usage: bun run scripts/generate-openapi.ts [output-path]
 * Default output: ./openapi.json
 */
import { writeFileSync } from 'node:fs';
import { generateOpenApiDocument } from 'trpc-to-openapi';
import { appRouter } from '../packages/server/src/routers/_app';

const outputPath = process.argv[2] ?? 'openapi.json';

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'MacGamingDB API',
  description: 'REST API for MacGamingDB — Mac gaming performance reports.',
  version: '1.0.0',
  baseUrl: 'https://macgamingdb.app/api/rest',
  tags: ['games', 'reviews', 'mac-configs', 'contributors'],
});

writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

const pathCount = Object.keys(openApiDocument.paths ?? {}).length;
console.log(`Wrote ${outputPath} (${pathCount} paths)`);
