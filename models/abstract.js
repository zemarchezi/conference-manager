import database from 'infra/database.js';

async function create(abstractData) {
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

async function findAll(options = {}) {
  const { conference_id, author_id, status, limit = 30, offset = 0 } = options;

  let whereConditions = [];
  let values = [];
  let paramCount = 1;

  if (conference_id) {
    whereConditions.push(`a.conference_id = $${paramCount}`);
    values.push(conference_id);
    paramCount++;
  }

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

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  values.push(limit, offset);

  const query = {
    text: `
      SELECT 
        a.*,
        u.username as author_username,
        c.title as conference_title
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

async function findOneById(abstractId) {
  const query = {
    text: `
      SELECT 
        a.*, 
        u.username as author_username,
        c.title as conference_title
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

async function update(abstractId, updateData) {
  const query = {
    text: `
      UPDATE abstracts SET
        title = COALESCE($2, title),
        content = COALESCE($3, content),
        keywords = COALESCE($4, keywords),
        status = COALESCE($5, status),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
    values: [
      abstractId,
      updateData.title,
      updateData.content,
      updateData.keywords,
      updateData.status,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function updateStatus(abstractId, status) {
  const query = {
    text: `
      UPDATE abstracts SET
        status = $2,
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
    values: [abstractId, status],
  };

  const result = await database.query(query);
  return result.rows[0];
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  update,
  updateStatus,
});
