import database from 'infra/database.js';

const REGISTRATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    WAITLIST: 'waitlist',
};

const PAYMENT_STATUS = {
    UNPAID: 'unpaid',
    PAID: 'paid',
    REFUNDED: 'refunded',
};

async function create(conferenceId, userId, registrationData) {
    const query = {
        text: `
      INSERT INTO conference_registrations (
        conference_id, user_id, registration_data, status, payment_status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
        values: [
            conferenceId,
            userId,
            JSON.stringify(registrationData),
            REGISTRATION_STATUS.PENDING,
            PAYMENT_STATUS.UNPAID,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConferenceId(conferenceId, options = {}) {
    const { status, limit = 100, offset = 0 } = options;

    let whereClause = 'WHERE conference_id = $1';
    const values = [conferenceId];
    let paramCount = 2;

    if (status) {
        whereClause += ` AND status = $${paramCount}`;
        values.push(status);
        paramCount++;
    }

    values.push(limit, offset);

    const query = {
        text: `
      SELECT 
        cr.*,
        u.username,
        u.email as user_email
      FROM conference_registrations cr
      JOIN users u ON cr.user_id = u.id
      ${whereClause}
      ORDER BY cr.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1};
    `,
        values,
    };

    const result = await database.query(query);
    return result.rows;
}

async function findByUserId(userId, conferenceId = null) {
    const query = conferenceId
        ? {
              text: `
          SELECT 
            cr.*,
            c.title as conference_title,
            c. slug as conference_slug,
            c.start_date,
            c.end_date
          FROM conference_registrations cr
          JOIN conferences c ON cr.conference_id = c.id
          WHERE cr.user_id = $1 AND cr.conference_id = $2;
        `,
              values: [userId, conferenceId],
          }
        : {
              text: `
          SELECT 
            cr.*,
            c. title as conference_title,
            c.slug as conference_slug,
            c.start_date,
            c.end_date
          FROM conference_registrations cr
          JOIN conferences c ON cr.conference_id = c.id
          WHERE cr.user_id = $1
          ORDER BY c.start_date DESC;
        `,
              values: [userId],
          };

    const result = await database.query(query);
    return conferenceId ? result.rows[0] : result.rows;
}

async function findById(registrationId, conferenceId = null) {
    const query = conferenceId
        ? {
              text: `
          SELECT 
            cr.*,
            u.username,
            u.email as user_email,
            c.title as conference_title
          FROM conference_registrations cr
          JOIN users u ON cr.user_id = u.id
          JOIN conferences c ON cr.conference_id = c.id
          WHERE cr.id = $1 AND cr.conference_id = $2;
        `,
              values: [registrationId, conferenceId],
          }
        : {
              text: `
          SELECT 
            cr.*,
            u.username,
            u.email as user_email,
            c.title as conference_title
          FROM conference_registrations cr
          JOIN users u ON cr. user_id = u.id
          JOIN conferences c ON cr.conference_id = c.id
          WHERE cr.id = $1;
        `,
              values: [registrationId],
          };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(registrationId, conferenceId, updateData) {
    const { registration_data, status, payment_status, payment_amount, notes } =
        updateData;

    const query = {
        text: `
      UPDATE conference_registrations
      SET registration_data = COALESCE($3, registration_data),
          status = COALESCE($4, status),
          payment_status = COALESCE($5, payment_status),
          payment_amount = COALESCE($6, payment_amount),
          notes = COALESCE($7, notes),
          updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
        values: [
            registrationId,
            conferenceId,
            registration_data ? JSON.stringify(registration_data) : null,
            status,
            payment_status,
            payment_amount,
            notes,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function deleteById(registrationId, conferenceId) {
    const query = {
        text: 'DELETE FROM conference_registrations WHERE id = $1 AND conference_id = $2 RETURNING *;',
        values: [registrationId, conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function getStats(conferenceId) {
    const query = {
        text: `
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'waitlist') as waitlist,
        COUNT(*) FILTER (WHERE payment_status = 'paid') as paid,
        COUNT(*) FILTER (WHERE payment_status = 'unpaid') as unpaid
      FROM conference_registrations
      WHERE conference_id = $1;
    `,
        values: [conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

export default Object.freeze({
    create,
    findByConferenceId,
    findByUserId,
    findById,
    update,
    deleteById,
    getStats,
    REGISTRATION_STATUS,
    PAYMENT_STATUS,
});
