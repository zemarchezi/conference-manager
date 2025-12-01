import database from 'infra/database.js';
import crypto from 'crypto';

async function create(registrationData) {
    const confirmationCode = generateConfirmationCode();

    const query = {
        text: `
      INSERT INTO registrations (
        conference_id, user_id, status, registration_type,
        registration_data, payment_status, payment_amount, confirmation_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
        values: [
            registrationData.conference_id,
            registrationData.user_id,
            registrationData.status || 'confirmed',
            registrationData.registration_type || 'regular',
            JSON.stringify(registrationData.registration_data || {}),
            registrationData.payment_status || 'not_required',
            registrationData.payment_amount || 0,
            confirmationCode,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConferenceId(conferenceId, options = {}) {
    const { status, limit = 100, offset = 0 } = options;

    let queryText = `
    SELECT 
      r.*,
      u.username,
      u.email,
      u.name as user_name
    FROM registrations r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.conference_id = $1
  `;

    const values = [conferenceId];
    let valueIndex = 2;

    if (status) {
        queryText += ` AND r.status = $${valueIndex}`;
        values.push(status);
        valueIndex++;
    }

    queryText += ` ORDER BY r. created_at DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);

    const result = await database.query({ text: queryText, values });
    return result.rows;
}

async function findByUserId(userId, options = {}) {
    const { status, limit = 50, offset = 0 } = options;

    let queryText = `
    SELECT 
      r.*,
      c.title as conference_title,
      c.slug as conference_slug,
      c.start_date,
      c.end_date,
      c.location
    FROM registrations r
    LEFT JOIN conferences c ON r.conference_id = c.id
    WHERE r.user_id = $1
  `;

    const values = [userId];
    let valueIndex = 2;

    if (status) {
        queryText += ` AND r.status = $${valueIndex}`;
        values.push(status);
        valueIndex++;
    }

    queryText += ` ORDER BY c.start_date DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);

    const result = await database.query({ text: queryText, values });
    return result.rows;
}

async function findByUserAndConference(userId, conferenceId) {
    const query = {
        text: `
      SELECT r.*
      FROM registrations r
      WHERE r.user_id = $1 AND r.conference_id = $2
    `,
        values: [userId, conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConfirmationCode(confirmationCode) {
    const query = {
        text: `
      SELECT 
        r.*,
        c.title as conference_title,
        c.slug as conference_slug,
        u.username,
        u.email,
        u.name as user_name
      FROM registrations r
      LEFT JOIN conferences c ON r.conference_id = c.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.confirmation_code = $1
    `,
        values: [confirmationCode],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findById(registrationId) {
    const query = {
        text: 'SELECT * FROM registrations WHERE id = $1',
        values: [registrationId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(registrationId, updateData) {
    const query = {
        text: `
      UPDATE registrations SET
        status = COALESCE($2, status),
        registration_type = COALESCE($3, registration_type),
        registration_data = COALESCE($4, registration_data),
        payment_status = COALESCE($5, payment_status),
        payment_amount = COALESCE($6, payment_amount),
        attended = COALESCE($7, attended),
        updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
        values: [
            registrationId,
            updateData.status,
            updateData.registration_type,
            updateData.registration_data
                ? JSON.stringify(updateData.registration_data)
                : null,
            updateData.payment_status,
            updateData.payment_amount,
            updateData.attended,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function cancelRegistration(registrationId) {
    const query = {
        text: `
      UPDATE registrations 
      SET status = 'cancelled', updated_at = (now() at time zone 'utc')
      WHERE id = $1
      RETURNING *;
    `,
        values: [registrationId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function getRegistrationCount(conferenceId, status = null) {
    let queryText =
        'SELECT COUNT(*) FROM registrations WHERE conference_id = $1';
    const values = [conferenceId];

    if (status) {
        queryText += ' AND status = $2';
        values.push(status);
    }

    const result = await database.query({ text: queryText, values });
    return parseInt(result.rows[0].count);
}

function generateConfirmationCode() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

const REGISTRATION_TYPES = {
    REGULAR: 'regular',
    STUDENT: 'student',
    SPEAKER: 'speaker',
    SPONSOR: 'sponsor',
    VIP: 'vip',
};

const REGISTRATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    WAITLIST: 'waitlist',
};

export default Object.freeze({
    create,
    findById,
    findByConferenceId,
    findByUserAndConference,
    findByConfirmationCode,
    update,
    cancelRegistration,
    getRegistrationCount,
    REGISTRATION_TYPES,
    REGISTRATION_STATUS,
});
