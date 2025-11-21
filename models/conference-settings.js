import database from 'infra/database.js';

const DEFAULT_SETTINGS = {
  primary_color: '#3b82f6',
  secondary_color: '#1e40af',
  abstract_max_length: 5000,
  keywords_required: false,
  custom_fields: [],
  enable_reviews: true,
  enable_public_schedule: true,
  enable_abstract_submission: true,
  custom_email_templates: {},
};

async function create(conference_id, settings = {}) {
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  const query = {
    text: `
      INSERT INTO conference_settings (
        conference_id, logo_url, primary_color, secondary_color, custom_css,
        abstract_max_length, keywords_required, custom_fields,
        enable_reviews, enable_public_schedule, enable_abstract_submission,
        custom_email_templates, notification_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `,
    values: [
      conference_id,
      mergedSettings.logo_url || null,
      mergedSettings.primary_color,
      mergedSettings.secondary_color,
      mergedSettings.custom_css || null,
      mergedSettings.abstract_max_length,
      mergedSettings.keywords_required,
      JSON.stringify(mergedSettings.custom_fields),
      mergedSettings.enable_reviews,
      mergedSettings.enable_public_schedule,
      mergedSettings.enable_abstract_submission,
      JSON.stringify(mergedSettings.custom_email_templates),
      mergedSettings.notification_email || null,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function findByConferenceId(conference_id) {
  const query = {
    text: 'SELECT * FROM conference_settings WHERE conference_id = $1',
    values: [conference_id],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function update(conference_id, updateData) {
  const query = {
    text: `
      UPDATE conference_settings SET
        logo_url = COALESCE($2, logo_url),
        primary_color = COALESCE($3, primary_color),
        secondary_color = COALESCE($4, secondary_color),
        custom_css = COALESCE($5, custom_css),
        abstract_max_length = COALESCE($6, abstract_max_length),
        keywords_required = COALESCE($7, keywords_required),
        custom_fields = COALESCE($8, custom_fields),
        enable_reviews = COALESCE($9, enable_reviews),
        enable_public_schedule = COALESCE($10, enable_public_schedule),
        enable_abstract_submission = COALESCE($11, enable_abstract_submission),
        custom_email_templates = COALESCE($12, custom_email_templates),
        notification_email = COALESCE($13, notification_email),
        updated_at = (now() at time zone 'utc')
      WHERE conference_id = $1
      RETURNING *;
    `,
    values: [
      conference_id,
      updateData.logo_url,
      updateData.primary_color,
      updateData.secondary_color,
      updateData.custom_css,
      updateData.abstract_max_length,
      updateData.keywords_required,
      updateData.custom_fields ? JSON.stringify(updateData.custom_fields) : null,
      updateData.enable_reviews,
      updateData.enable_public_schedule,
      updateData.enable_abstract_submission,
      updateData.custom_email_templates ? JSON.stringify(updateData.custom_email_templates) : null,
      updateData.notification_email,
    ],
  };

  const result = await database.query(query);
  return result.rows[0];
}

export default Object.freeze({
  create,
  findByConferenceId,
  update,
  DEFAULT_SETTINGS,
});