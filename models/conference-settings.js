import database from 'infra/database.js';

async function create(conferenceId, settingsData = {}) {
    const defaultSettings = {
        logo_url: null,
        banner_url: null,
        primary_color: '#667eea',
        secondary_color: '#764ba2',
        conference_format: 'In-Person',
        about_text: null,
        important_dates: null,
        topics: null,
        sponsors: null,
        venue_name: null,
        venue_address: null,
        venue_description: null,
        venue_coordinates: null,
        accommodation_info: null,
        travel_info: null,
        submission_guidelines: null,
        submission_deadline: null,
        notification_date: null,
        enable_registration: true,
        enable_abstract_submission: true,
        max_registrations: null,
        ...settingsData,
    };

    const query = {
        text: `
      INSERT INTO conference_settings (
        conference_id, logo_url, banner_url, primary_color, secondary_color,
        conference_format, about_text, important_dates, topics, sponsors,
        venue_name, venue_address, venue_description, venue_coordinates,
        accommodation_info, travel_info, submission_guidelines,
        submission_deadline, notification_date, enable_registration,
        enable_abstract_submission, max_registrations
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      RETURNING *;
    `,
        values: [
            conferenceId,
            defaultSettings.logo_url,
            defaultSettings.banner_url,
            defaultSettings.primary_color,
            defaultSettings.secondary_color,
            defaultSettings.conference_format,
            defaultSettings.about_text,
            defaultSettings.important_dates,
            defaultSettings.topics,
            defaultSettings.sponsors,
            defaultSettings.venue_name,
            defaultSettings.venue_address,
            defaultSettings.venue_description,
            defaultSettings.venue_coordinates,
            defaultSettings.accommodation_info,
            defaultSettings.travel_info,
            defaultSettings.submission_guidelines,
            defaultSettings.submission_deadline,
            defaultSettings.notification_date,
            defaultSettings.enable_registration,
            defaultSettings.enable_abstract_submission,
            defaultSettings.max_registrations,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConferenceId(conferenceId) {
    const query = {
        text: 'SELECT * FROM conference_settings WHERE conference_id = $1',
        values: [conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(conferenceId, updateData) {
    const fields = [];
    const values = [conferenceId];
    let paramCount = 2;

    Object.keys(updateData).forEach((key) => {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
    });

    if (fields.length === 0) {
        return findByConferenceId(conferenceId);
    }

    const query = {
        text: `
      UPDATE conference_settings
      SET ${fields.join(', ')},
          updated_at = (now() at time zone 'utc')
      WHERE conference_id = $1
      RETURNING *;
    `,
        values,
    };

    const result = await database.query(query);
    return result.rows[0];
}

export default Object.freeze({
    create,
    findByConferenceId,
    update,
});
