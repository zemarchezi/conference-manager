import database from 'infra/database.js';

async function create(conferenceId, speakerData) {
    const {
        name,
        title,
        organization,
        bio,
        photo_url,
        website,
        twitter,
        linkedin,
        is_keynote = false,
        display_order = 0,
    } = speakerData;

    const query = {
        text: `
      INSERT INTO speakers (
        conference_id, name, title, organization, bio, 
        photo_url, website, twitter, linkedin, is_keynote, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `,
        values: [
            conferenceId,
            name,
            title,
            organization,
            bio,
            photo_url,
            website,
            twitter,
            linkedin,
            is_keynote,
            display_order,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConferenceId(conferenceId) {
    const query = {
        text: `
      SELECT * FROM speakers
      WHERE conference_id = $1
      ORDER BY is_keynote DESC, display_order ASC, created_at ASC;
    `,
        values: [conferenceId],
    };

    const result = await database.query(query);
    return result.rows;
}

async function findById(speakerId, conferenceId = null) {
    const query = conferenceId
        ? {
              text: 'SELECT * FROM speakers WHERE id = $1 AND conference_id = $2',
              values: [speakerId, conferenceId],
          }
        : {
              text: 'SELECT * FROM speakers WHERE id = $1',
              values: [speakerId],
          };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(speakerId, conferenceId, updateData) {
    const fields = [];
    const values = [speakerId, conferenceId];
    let paramCount = 3;

    Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = $${paramCount}`);
            values.push(updateData[key]);
            paramCount++;
        }
    });

    if (fields.length === 0) {
        return findById(speakerId, conferenceId);
    }

    const query = {
        text: `
      UPDATE speakers
      SET ${fields.join(', ')},
          updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
        values,
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function deleteById(speakerId, conferenceId) {
    const query = {
        text: 'DELETE FROM speakers WHERE id = $1 AND conference_id = $2 RETURNING *;',
        values: [speakerId, conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

export default Object.freeze({
    create,
    findByConferenceId,
    findById,
    update,
    deleteById,
});
