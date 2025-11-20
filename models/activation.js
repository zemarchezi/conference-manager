import database from 'infra/database.js';
import { randomBytes } from 'crypto';
import user from 'models/user.js';

async function create(userObj) {
  const token = randomBytes(48).toString('base64');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const query = {
    text: `
      INSERT INTO activate_account_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, token, expires_at;
    `,
    values: [userObj.id, token, expiresAt],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findOneTokenByUserId(userId) {
  const query = {
    text: `
      SELECT * FROM activate_account_tokens
      WHERE user_id = $1
        AND used = false
        AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1;
    `,
    values: [userId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function activateUserUsingTokenId(tokenId) {
  const client = await database.getNewClient();

  try {
    await client.query('BEGIN');

    const tokenQuery = {
      text: `
        UPDATE activate_account_tokens
        SET used = true
        WHERE id = $1
        RETURNING user_id;
      `,
      values: [tokenId],
    };

    const tokenResult = await client.query(tokenQuery);
    
    if (tokenResult.rowCount === 0) {
      throw new Error('Token not found');
    }

    const userId = tokenResult.rows[0].user_id;

    await user.addFeatures(userId, [
      'create:session',
      'read:session',
      'create:content',
      'update:content',
      'create:conference',
      'create:abstract',
      'create:review',
    ]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default Object.freeze({
  create,
  findOneTokenByUserId,
  activateUserUsingTokenId,
});
