import { v4 as uuidv4 } from 'uuid';
import database from '../../infra/database.js';

export async function createTestUser(overrides = {}) {
  const userId = uuidv4();
  const username = overrides.username || `testuser_${Date.now()}`;
  const email = overrides.email || `test_${Date.now()}@example.com`;
  
  const result = await database.query({
    text: `
      INSERT INTO users (id, username, email, password, email_verified)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `,
    values: [userId, username, email, 'hashed_password'],
  });

  return result. rows[0];
}

export async function createTestConference(organizerId, overrides = {}) {
  const conferenceId = uuidv4();
  const slug = overrides.slug || `test-conf-${Date.now()}`;
  
  const result = await database.query({
    text: `
      INSERT INTO conferences (
        id, title, slug, description, location,
        start_date, end_date, organizer_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
    values: [
      conferenceId,
      overrides.title || 'Test Conference',
      slug,
      overrides.description || 'Test Description',
      overrides.location || 'Test Location',
      overrides.start_date || new Date('2025-06-01'),
      overrides.end_date || new Date('2025-06-03'),
      organizerId,
      overrides.status || 'active',
    ],
  });

  return result.rows[0];
}

export async function createAuthSession(userId) {
  const sessionId = uuidv4();
  const token = uuidv4();
  
  await database.query({
    text: `
      INSERT INTO sessions (id, user_id, token, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '1 day')
    `,
    values: [sessionId, userId, token],
  });

  return `session_token=${token}`;
}

export async function cleanupTestData(userId, conferenceId) {
  // Delete in order due to foreign key constraints
  if (conferenceId) {
    await database.query({
      text: 'DELETE FROM registrations WHERE conference_id = $1',
      values: [conferenceId],
    });
    await database.query({
      text: 'DELETE FROM speakers WHERE conference_id = $1',
      values: [conferenceId],
    });
    await database.query({
      text: 'DELETE FROM conferences WHERE id = $1',
      values: [conferenceId],
    });
  }
  
  if (userId) {
    await database.query({
      text: 'DELETE FROM sessions WHERE user_id = $1',
      values: [userId],
    });
    await database.query({
      text: 'DELETE FROM users WHERE id = $1',
      values: [userId],
    });
  }
}