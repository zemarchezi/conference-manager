import database from 'infra/database.js';
import { randomBytes } from 'crypto';

async function create(userId) {
  const token = randomBytes(48).toString('base64');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const query = {
    text: `
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, token, user_id, expires_at, created_at;
    `,
    values: [token, userId, expiresAt],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findOneValidByToken(token) {
  const query = {
    text: `
      SELECT * FROM sessions
      WHERE token = $1
        AND expires_at > now()
      LIMIT 1;
    `,
    values: [token],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function expireById(sessionId) {
  const query = {
    text: `
      UPDATE sessions
      SET expires_at = now()
      WHERE id = $1;
    `,
    values: [sessionId],
  };

  await database.query(query);
}

async function expireByToken(token) {
  const query = {
    text: `
      UPDATE sessions
      SET expires_at = now()
      WHERE token = $1;
    `,
    values: [token],
  };

  await database.query(query);
}

export default Object.freeze({
  create,
  findOneValidByToken,
  expireById,
  expireByToken,
});
