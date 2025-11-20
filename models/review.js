import database from 'infra/database.js';

async function create(reviewData) {
  const query = {
    text: `
      INSERT INTO reviews (abstract_id, reviewer_id, score, comments, recommendation)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    values: [
      reviewData.abstract_id,
      reviewData.reviewer_id,
      reviewData.score,
      reviewData.comments,
      reviewData.recommendation,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findAll(options = {}) {
  const { abstract_id, reviewer_id, limit = 30, offset = 0 } = options;

  let whereConditions = [];
  let values = [];
  let paramCount = 1;

  if (abstract_id) {
    whereConditions.push(`r.abstract_id = $${paramCount}`);
    values.push(abstract_id);
    paramCount++;
  }

  if (reviewer_id) {
    whereConditions.push(`r.reviewer_id = $${paramCount}`);
    values.push(reviewer_id);
    paramCount++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  values.push(limit, offset);

  const query = {
    text: `
      SELECT 
        r.*,
        u.username as reviewer_username,
        a.title as abstract_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN abstracts a ON r.abstract_id = a.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1};
    `,
    values,
  };

  const result = await database.query(query);
  return result.rows;
}

async function findOneById(reviewId) {
  const query = {
    text: `
      SELECT 
        r.*, 
        u.username as reviewer_username,
        a.title as abstract_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN abstracts a ON r.abstract_id = a.id
      WHERE r.id = $1;
    `,
    values: [reviewId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function update(reviewId, updateData) {
  const query = {
    text: `
      UPDATE reviews SET
        score = COALESCE($2, score),
        comments = COALESCE($3, comments),
        recommendation = COALESCE($4, recommendation),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
    values: [
      reviewId,
      updateData.score,
      updateData.comments,
      updateData.recommendation,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function getAverageScore(abstractId) {
  const query = {
    text: `
      SELECT AVG(score) as average_score, COUNT(*) as total_reviews
      FROM reviews
      WHERE abstract_id = $1;
    `,
    values: [abstractId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function deleteById(reviewId) {
  const query = {
    text: 'DELETE FROM reviews WHERE id = $1 RETURNING *;',
    values: [reviewId],
  };

  const result = await database.query(query);
  return result.rows[0];
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  update,
  getAverageScore,
  deleteById,
});