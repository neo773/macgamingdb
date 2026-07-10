import { copyFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.join(import.meta.dirname, '..');
const snapshotPath = path.join(
  repoRoot,
  'packages',
  'macgamingdb-server',
  'prisma',
  'prod-snapshot.db',
);
const testDatabasePath = path.join(
  repoRoot,
  'packages',
  'macgamingdb-server',
  'prisma',
  'prod-migration-test.db',
);

const runMigrateCommand = (label: string): string => {
  const result = spawnSync(
    'node',
    ['packages/macgamingdb-server/dist/command/main.js', 'migrate-database'],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        LIBSQL_DATABASE_URL: `file:${testDatabasePath}`,
        LIBSQL_DATABASE_TOKEN: '',
      },
      encoding: 'utf-8',
    },
  );

  const output = `${result.stdout}\n${result.stderr}`;
  console.log(`\n===== ${label} =====`);
  console.log(output.trim());

  if (result.status !== 0) {
    console.error(`${label} exited with ${result.status}`);
    process.exit(1);
  }

  return output;
};

const assertIncludes = (output: string, needle: string, label: string) => {
  if (!output.includes(needle)) {
    console.error(`ASSERTION FAILED (${label}): expected output to include "${needle}"`);
    process.exit(1);
  }
};

if (!existsSync(snapshotPath)) {
  console.error(`Missing production snapshot at ${snapshotPath}`);
  process.exit(1);
}

for (const suffix of ['', '-wal', '-shm']) {
  const stalePath = `${testDatabasePath}${suffix}`;
  if (existsSync(stalePath)) rmSync(stalePath);
}
copyFileSync(snapshotPath, testDatabasePath);
console.log('Fresh copy of production snapshot created');

const firstRun = runMigrateCommand('first run (fresh snapshot)');
assertIncludes(firstRun, 'Pending migrations: 0004_curly_chamber, 0005_flippant_lionheart, 0006_slow_meggan', 'first run pending list');
assertIncludes(firstRun, 'Validation passed', 'first run validation');

const secondRun = runMigrateCommand('second run (idempotency)');
assertIncludes(secondRun, 'Pending migrations: none', 'second run pending list');
assertIncludes(secondRun, 'Slugs assigned: 0', 'second run slug count');
assertIncludes(secondRun, 'Validation passed', 'second run validation');

console.log('\nAll assertions passed: migration is reproducible and idempotent.');
