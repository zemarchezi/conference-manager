import path from 'path';
import { fileURLToPath } from 'url';
import { migrate } from 'node-pg-migrate';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPendingMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');

  await migrate({
    direction: 'up',
    migrationsTable: 'pgmigrations',
    dir: migrationsDir,
    checkOrder: true,
    verbose: true,
    count: Infinity,
  });

  console.log('✅ All migrations completed');
}

export default Object.freeze({
  runPendingMigrations,
});
