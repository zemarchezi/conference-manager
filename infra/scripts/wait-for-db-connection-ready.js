import database from '../database.js';

async function waitForDatabase() {
  const maxAttempts = 30;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      await database.query('SELECT 1');
      console.log('✅ Database connection is ready!');
      return;
    } catch (error) {
      attempt++;
      console.log(`⏳ Waiting for database connection (${attempt}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Could not connect to database');
}

waitForDatabase();
