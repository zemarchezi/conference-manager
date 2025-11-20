import { Pool } from 'pg';
import retry from 'async-retry';

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function query(queryObject) {
  return retry(
    async (bail) => {
      try {
        return await pool.query(queryObject);
      } catch (error) {
        if (error.message.includes('Connection terminated')) {
          throw error;
        }
        bail(error);
      }
    },
    {
      retries: 3,
      minTimeout: 100,
      maxTimeout: 500,
    }
  );
}

async function getNewClient() {
  const client = await pool.connect();
  return client;
}

export default Object.freeze({
  query,
  getNewClient,
});