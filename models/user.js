import bcrypt from 'bcryptjs';
import database from 'infra/database.js';

const saltRounds = 10;

async function create({ username, email, password }) {
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert user into database
  const query = {
    text: `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at, updated_at, features
    `,
    values: [username, email, hashedPassword],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByUsername(username) {
  const query = {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByEmail(email) {
  const query = {
    text: 'SELECT * FROM users WHERE email = $1',
    values: [email],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findById(id) {
  const query = {
    text: 'SELECT * FROM users WHERE id = $1',
    values: [id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function updatePassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const query = {
    text: `
      UPDATE users
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, username, email
    `,
    values: [hashedPassword, userId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

async function findAll() {
  const query = {
    text: 'SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC',
  };

  const result = await database.query(query);
  return result.rows;
}

export default {
  create,
  findByUsername,
  findByEmail,
  findById,
  updatePassword,
  comparePassword,
  findAll,
};
