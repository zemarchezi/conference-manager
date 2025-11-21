import database from 'infra/database.js';
import slugify from 'slugify';

async function create({ name, description, owner_id, settings = {} }) {
  const slug = await generateUniqueSlug(name);

  const query = {
    text: `
      INSERT INTO organizations (name, slug, description, owner_id, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    values: [name, slug, description, owner_id, JSON.stringify(settings)],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findById(id) {
  const query = {
    text: `
      SELECT o.*, u.username as owner_username
      FROM organizations o
      JOIN users u ON o.owner_id = u.id
      WHERE o.id = $1;
    `,
    values: [id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findBySlug(slug) {
  const query = {
    text: `
      SELECT o.*, u.username as owner_username
      FROM organizations o
      JOIN users u ON o.owner_id = u.id
      WHERE o.slug = $1;
    `,
    values: [slug],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByOwnerId(owner_id) {
  const query = {
    text: `
      SELECT * FROM organizations
      WHERE owner_id = $1
      ORDER BY created_at DESC;
    `,
    values: [owner_id],
  };

  const result = await database.query(query);
  return result.rows;
}

async function update(id, updateData) {
  const query = {
    text: `
      UPDATE organizations SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        settings = COALESCE($4, settings),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
    values: [
      id,
      updateData.name,
      updateData.description,
      updateData.settings ? JSON.stringify(updateData.settings) : null,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function remove(id) {
  const query = {
    text: 'DELETE FROM organizations WHERE id = $1 RETURNING *;',
    values: [id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function generateUniqueSlug(name) {
  let slug = slugify(name, { lower: true, strict: true });
  let counter = 1;

  while (await slugExists(slug)) {
    slug = `${slugify(name, { lower: true, strict: true })}-${counter}`;
    counter++;
  }

  return slug;
}

async function slugExists(slug) {
  const query = {
    text: 'SELECT id FROM organizations WHERE slug = $1',
    values: [slug],
  };

  const result = await database.query(query);
  return result.rowCount > 0;
}

export default Object.freeze({
  create,
  findById,
  findBySlug,
  findByOwnerId,
  update,
  remove,
});