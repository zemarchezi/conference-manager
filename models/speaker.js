import database from 'infra/database.js';

async function create(speakerData) {
    const query = {
        text: `
      INSERT INTO speakers (
        conference_id, name, title, organization, bio,
        photo_url, website, twitter, linkedin, email,
        is_keynote, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `,
        values: [
            speakerData.conference_id,
            speakerData.name,
            speakerData.title || null,
            speakerData.organization || null,
            speakerData.bio || null,
            speakerData.photo_url || null,
            speakerData.website || null,
            speakerData.twitter || null,
            speakerData.linkedin || null,
            speakerData.email || null,
            speakerData.is_keynote || false,
            speakerData.display_order || 0,
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
      ORDER BY is_keynote DESC, display_order ASC, name ASC
    `,
        values: [conferenceId],
    };

    const result = await database.query(query);
    return result.rows;
}

async function findById(speakerId) {
    const query = {
        text: 'SELECT * FROM speakers WHERE id = $1',
        values: [speakerId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(speakerId, updateData) {
    const fields = [];
    const values = [speakerId];
    let index = 2;

    const allowedFields = [
        'name',
        'title',
        'organization',
        'bio',
        'photo_url',
        'website',
        'twitter',
        'linkedin',
        'email',
        'is_keynote',
        'display_order',
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            fields.push(`${field} = $${index}`);
            values.push(updateData[field]);
            index++;
        }
    });

    if (fields.length === 0) {
        return findById(speakerId);
    }

    const query = {
        text: `
      UPDATE speakers
      SET ${fields.join(', ')}, updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
        values,
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function remove(speakerId) {
    const query = {
        text: 'DELETE FROM speakers WHERE id = $1 RETURNING *',
        values: [speakerId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

export default Object.freeze({
    create,
    findByConferenceId,
    findById,
    update,
    remove,
});
