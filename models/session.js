import database from 'infra/database.js';
import crypto from 'crypto';

async function create(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const query = {
    text: `
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at, created_at
    `,
    values: [userId, token, expiresAt],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByToken(token) {
  const query = {
    text: `
      SELECT s.*, u.username, u.email, u.features
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1
    `,
    values: [token],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findOneValidByToken(token) {
  const query = {
    text: `
      SELECT s.*, u.username, u.email, u.features
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 
        AND s.expires_at > NOW()
    `,
    values: [token],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function deleteByToken(token) {
  const query = {
    text: 'DELETE FROM sessions WHERE token = $1',
    values: [token],
  };

  await database.query(query);
}

async function deleteExpired() {
  const query = {
    text: 'DELETE FROM sessions WHERE expires_at < NOW()',
  };

  await database.query(query);
}

async function deleteByUserId(userId) {
  const query = {
    text: 'DELETE FROM sessions WHERE user_id = $1',
    values: [userId],
  };

  await database.query(query);
}

export default {
  create,
  findByToken,
  findOneValidByToken,
  deleteByToken,
  deleteExpired,
  deleteByUserId,
};