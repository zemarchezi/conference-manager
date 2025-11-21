import database from 'infra/database.js';
import organization from 'models/organization.js';
import userConferenceRole from 'models/user-conference-role.js';

async function createOrganization({ name, owner_id = null }) {
  if (!owner_id) {
    const owner = await createUser({
      username: `owner_${Date.now()}`,
      email: `owner_${Date.now()}@example.com`,
    });
    owner_id = owner.id;
  }

  return await organization.create({
    name,
    description: 'Test organization',
    owner_id,
  });
}

async function assignConferenceRole({ user_id, conference_id, role }) {
  return await userConferenceRole.assignRole({
    user_id,
    conference_id,
    role,
  });
}

async function createAbstract({ conference_id, author_id, title, content }) {
  const query = {
    text: `
      INSERT INTO abstracts (conference_id, author_id, title, content, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *;
    `,
    values: [conference_id, author_id, title, content],
  };

  const result = await database.query(query);
  return result.rows[0];
}

// Add to existing orchestrator exports
export default {
  // ... existing exports
  createOrganization,
  assignConferenceRole,
  createAbstract,
};