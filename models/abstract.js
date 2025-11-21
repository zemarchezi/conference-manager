import database from 'infra/database.js';
import userConferenceRole from 'models/user-conference-role.js';

async function create(abstractData) {
  // Ensure conference_id is always provided
  if (!abstractData.conference_id) {
    throw new Error('conference_id is required');
  }

  const query = {
    text: `
      INSERT INTO abstracts (conference_id, author_id, title, content, keywords, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `,
    values: [
      abstractData.conference_id,
      abstractData.author_id,
      abstractData.title,
      abstractData.content,
      abstractData.keywords || [],
      abstractData.status || 'submitted',
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findAll(conference_id, options = {}) {
  // Conference ID is now required, not optional
  if (!conference_id) {
    throw new Error('conference_id is required for querying abstracts');
  }

  const { author_id, status, limit = 30, offset = 0 } = options;

  let whereConditions = ['a.conference_id = $1'];
  let values = [conference_id];
  let paramCount = 2;

  if (author_id) {
    whereConditions.push(`a.author_id = $${paramCount}`);
    values.push(author_id);
    paramCount++;
  }

  if (status) {
    whereConditions.push(`a.status = $${paramCount}`);
    values.push(status);
    paramCount++;
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  values.push(limit, offset);

  const query = {
    text: `
      SELECT 
        a.*,
        u.username as author_username,
        u.email as author_email,
        c.title as conference_title,
        c.slug as conference_slug
      FROM abstracts a
      JOIN users u ON a.author_id = u.id
      JOIN conferences c ON a.conference_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1};
    `,
    values,
  };

  const result = await database.query(query);
  return result.rows;
}

async function findOneById(abstractId, conference_id) {
  // Enforce conference context when fetching by ID
  const query = conference_id
    ? {
        text: `
          SELECT 
            a.*, 
            u.username as author_username,
            u.email as author_email,
            c.title as conference_title,
            c.slug as conference_slug
          FROM abstracts a
          JOIN users u ON a.author_id = u.id
          JOIN conferences c ON a.conference_id = c.id
          WHERE a.id = $1 AND a.conference_id = $2;
        `,
        values: [abstractId, conference_id],
      }
    : {
        text: `
          SELECT 
            a.*, 
            u.username as author_username,
            u.email as author_email,
            c.title as conference_title,
            c.slug as conference_slug
          FROM abstracts a
          JOIN users u ON a.author_id = u.id
          JOIN conferences c ON a.conference_id = c.id
          WHERE a.id = $1;
        `,
        values: [abstractId],
      };

  const result = await database.query(query);
  return result.rows[0];
}

async function update(abstractId, conference_id, updateData) {
  // Ensure update is scoped to conference
  if (!conference_id) {
    throw new Error('conference_id is required for updating abstracts');
  }

  const query = {
    text: `
      UPDATE abstracts SET
        title = COALESCE($3, title),
        content = COALESCE($4, content),
        keywords = COALESCE($5, keywords),
        status = COALESCE($6, status),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
    values: [
      abstractId,
      conference_id,
      updateData.title,
      updateData.content,
      updateData.keywords,
      updateData.status,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function updateStatus(abstractId, conference_id, status) {
  if (!conference_id) {
    throw new Error('conference_id is required for updating abstract status');
  }

  const query = {
    text: `
      UPDATE abstracts SET
        status = $3,
        updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
    values: [abstractId, conference_id, status],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function deleteById(abstractId, conference_id) {
  if (!conference_id) {
    throw new Error('conference_id is required for deleting abstracts');
  }

  const query = {
    text: 'DELETE FROM abstracts WHERE id = $1 AND conference_id = $2 RETURNING *;',
    values: [abstractId, conference_id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function getCountByConference(conference_id) {
  const query = {
    text: 'SELECT COUNT(*) as count FROM abstracts WHERE conference_id = $1',
    values: [conference_id],
  };

  const result = await database.query(query);
  return parseInt(result.rows[0].count);
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  update,
  updateStatus,
  deleteById,
  getCountByConference,
});