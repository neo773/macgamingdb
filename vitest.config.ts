import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: { LOG_LEVEL: 'silent' },
    include: [
      'packages/macgamingdb-server/src/**/*.spec.ts',
      'packages/macgamingdb-server/test/**/*.integration-spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/macgamingdb-server/src/**/*.ts'],
      exclude: ['packages/macgamingdb-server/src/**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'macgamingdb-shared': path.resolve(
        __dirname,
        './packages/macgamingdb-shared/src',
      ),
    },
  },
});
