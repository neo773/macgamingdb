/**
 * Generates openapi.json from the tRPC router's OpenAPI-annotated procedures.
 *
 * Boots the NestJS AppModule and reads the runtime appRouter from nestjs-trpc's
 * AppRouterHost. The Nest bootstrapping lives inside the server package (where
 * its runtime dependencies resolve); this script only drives it.
 *
 * Usage: bun run scripts/generate-openapi.ts [output-path]
 * Default output: ./openapi.json
 */
import { writeOpenApiDocumentFile } from 'macgamingdb-server/engine/api/write-openapi-document';

const outputPath = process.argv[2] ?? 'openapi.json';

void writeOpenApiDocumentFile({ outputPath })
  .then((pathCount) => {
    console.log(`Wrote ${outputPath} (${pathCount} paths)`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
