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

async function findAll(conference_id, options = {}) {
  // Conference ID is required to scope reviews
  if (!conference_id) {
    throw new Error('conference_id is required for querying reviews');
  }

  const { abstract_id, reviewer_id, limit = 30, offset = 0 } = options;

  let whereConditions = ['c.id = $1'];
  let values = [conference_id];
  let paramCount = 2;

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

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  values.push(limit, offset);

  const query = {
    text: `
      SELECT 
        r.*,
        u.username as reviewer_username,
        a.title as abstract_title,
        a.conference_id,
        c.title as conference_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN abstracts a ON r.abstract_id = a.id
      JOIN conferences c ON a.conference_id = c.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1};
    `,
    values,
  };

  const result = await database.query(query);
  return result.rows;
}

async function findOneById(reviewId, conference_id) {
  // Enforce conference context
  const query = conference_id
    ? {
        text: `
          SELECT 
            r.*, 
            u.username as reviewer_username,
            a.title as abstract_title,
            a.conference_id,
            c.title as conference_title
          FROM reviews r
          JOIN users u ON r.reviewer_id = u.id
          JOIN abstracts a ON r.abstract_id = a.id
          JOIN conferences c ON a.conference_id = c.id
          WHERE r.id = $1 AND c.id = $2;
        `,
        values: [reviewId, conference_id],
      }
    : {
        text: `
          SELECT 
            r.*, 
            u.username as reviewer_username,
            a.title as abstract_title,
            a.conference_id,
            c.title as conference_title
          FROM reviews r
          JOIN users u ON r.reviewer_id = u.id
          JOIN abstracts a ON r.abstract_id = a.id
          JOIN conferences c ON a.conference_id = c.id
          WHERE r.id = $1;
        `,
        values: [reviewId],
      };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByAbstractId(abstract_id, conference_id) {
  if (!conference_id) {
    throw new Error('conference_id is required for querying reviews');
  }

  const query = {
    text: `
      SELECT 
        r.*,
        u.username as reviewer_username
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN abstracts a ON r.abstract_id = a.id
      WHERE r.abstract_id = $1 AND a.conference_id = $2
      ORDER BY r.created_at DESC;
    `,
    values: [abstract_id, conference_id],
  };

  const result = await database.query(query);
  return result.rows;
}

async function update(reviewId, conference_id, updateData) {
  if (!conference_id) {
    throw new Error('conference_id is required for updating reviews');
  }

  const query = {
    text: `
      UPDATE reviews r SET
        score = COALESCE($3, r.score),
        comments = COALESCE($4, r.comments),
        recommendation = COALESCE($5, r.recommendation),
        updated_at = (now() at time zone 'utc')
      FROM abstracts a
      WHERE r.id = $1 
        AND r.abstract_id = a.id 
        AND a.conference_id = $2
      RETURNING r.*;
    `,
    values: [
      reviewId,
      conference_id,
      updateData.score,
      updateData.comments,
      updateData.recommendation,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function getAverageScore(abstractId, conference_id) {
  if (!conference_id) {
    throw new Error('conference_id is required');
  }

  const query = {
    text: `
      SELECT AVG(r.score) as average_score, COUNT(*) as total_reviews
      FROM reviews r
      JOIN abstracts a ON r.abstract_id = a.id
      WHERE r.abstract_id = $1 AND a.conference_id = $2;
    `,
    values: [abstractId, conference_id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function deleteById(reviewId, conference_id) {
  if (!conference_id) {
    throw new Error('conference_id is required for deleting reviews');
  }

  const query = {
    text: `
      DELETE FROM reviews r
      USING abstracts a
      WHERE r.id = $1 
        AND r.abstract_id = a.id 
        AND a.conference_id = $2
      RETURNING r.*;
    `,
    values: [reviewId, conference_id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  findByAbstractId,
  update,
  getAverageScore,
  deleteById,
});