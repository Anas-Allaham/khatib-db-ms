/**
 * Convenience entry point.
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register seeder/seed-all.ts
 *
 * This file intentionally imports the two seed scripts sequentially through
 * child processes so each Nest application context is cleanly opened/closed.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function run(script: string) {
  const result = spawnSync(
    process.execPath,
    [
      '-r',
      'ts-node/register',
      '-r',
      'tsconfig-paths/register',
      resolve(__dirname, script),
    ],
    {
      stdio: 'inherit',
      env: process.env,
    },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('seed-users.ts');
run('seed-medical-cases.ts');

console.log('\nAll seeders completed successfully.');
