import database from 'infra/database.js';

async function create(conference_id, scheduleData) {
  if (!conference_id) {
    throw new Error('conference_id is required');
  }

  const { title, description, start_time, end_time, location, speaker } = scheduleData;

  const query = {
    text: `
      INSERT INTO schedule_items (
        conference_id, title, description, start_time, end_time, location, speaker
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `,
    values: [conference_id, title, description, start_time, end_time, location, speaker],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findAll(conference_id, options = {}) {
  if (!conference_id) {
    throw new Error('conference_id is required for querying schedule items');
  }

  const { limit = 100, offset = 0 } = options;

  const query = {
    text: `
      SELECT * FROM schedule_items
      WHERE conference_id = $1
      ORDER BY start_time ASC
      LIMIT $2 OFFSET $3;
    `,
    values: [conference_id, limit, offset],
  };

  const result = await database.query(query);
  return result.rows;
}

async function findOneById(id, conference_id) {
  const query = conference_id
    ? {
        text: 'SELECT * FROM schedule_items WHERE id = $1 AND conference_id = $2',
        values: [id, conference_id],
      }
    : {
        text: 'SELECT * FROM schedule_items WHERE id = $1',
        values: [id],
      };

  const result = await database.query(query);
  return result.rows[0];
}

async function update(id, conference_id, scheduleData) {
  if (!conference_id) {
    throw new Error('conference_id is required for updating schedule items');
  }

  const { title, description, start_time, end_time, location, speaker } = scheduleData;

  const query = {
    text: `
      UPDATE schedule_items
      SET title = COALESCE($3, title),
          description = COALESCE($4, description),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time),
          location = COALESCE($7, location),
          speaker = COALESCE($8, speaker),
          updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
    values: [id, conference_id, title, description, start_time, end_time, location, speaker],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function deleteById(id, conference_id) {
  if (!conference_id) {
    throw new Error('conference_id is required for deleting schedule items');
  }

  const query = {
    text: 'DELETE FROM schedule_items WHERE id = $1 AND conference_id = $2 RETURNING *;',
    values: [id, conference_id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

export default Object.freeze({
  create,
  findAll,
  findOneById,
  update,
  deleteById,
});