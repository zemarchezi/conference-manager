import database from 'infra/database.js';
import slugify from 'slugify';

async function create(conferenceData) {
  const slug = await generateUniqueSlug(conferenceData.title);

  const query = {
    text: `
      INSERT INTO conferences (title, slug, description, start_date, end_date, location, organizer_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    values: [
      conferenceData.title,
      slug,
      conferenceData.description,
      conferenceData.start_date,
      conferenceData.end_date,
      conferenceData.location,
      conferenceData.organizer_id,
      conferenceData.status || 'draft',
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findAll(options = {}) {
  const { limit = 30, offset = 0, status = 'active' } = options;

  const query = {
    text: `
      SELECT 
        c.*,
        u.username as organizer_username
      FROM conferences c
      JOIN users u ON c.organizer_id = u.id
      WHERE c.status = $1
      ORDER BY c.start_date DESC
      LIMIT $2 OFFSET $3;
    `,
    values: [status, limit, offset],
  };

  const result = await database.query(query);
  return result.rows;
}

async function findOneById(conferenceId) {
  const query = {
    text: `
      SELECT 
        c.*,
        u.username as organizer_username
      FROM conferences c
      JOIN users u ON c.organizer_id = u.id
      WHERE c.id = $1;
    `,
    values: [conferenceId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findOneBySlug(slug) {
  const query = {
    text: `
      SELECT 
        c.*,
        u.username as organizer_username
      FROM conferences c
      JOIN users u ON c.organizer_id = u.id
      WHERE c.slug = $1;
    `,
    values: [slug],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function update(conferenceId, updateData) {
  const query = {
    text: `
      UPDATE conferences SET
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        location = COALESCE($6, location),
        status = COALESCE($7, status),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
    values: [
      conferenceId,
      updateData.title,
      updateData.description,
      updateData.start_date,
      updateData.end_date,
      updateData.location,
      updateData.status,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function generateUniqueSlug(title) {
  let slug = slugify(title, { lower: true, strict: true });
  let counter = 1;

  while (await slugExists(slug)) {
    slug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
    counter++;
  }

  return slug;
}

async function slugExists(slug) {
  const query = {
    text: 'SELECT id FROM conferences WHERE slug = $1',
    values: [slug],
  };

  const result = await database.query(query);
  return result.rowCount > 0;
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  findOneBySlug,
  update,
});
