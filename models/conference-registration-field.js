import database from 'infra/database.js';

const FIELD_TYPES = {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    EMAIL: 'email',
    NUMBER: 'number',
    SELECT: 'select',
    MULTISELECT: 'multiselect',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    DATE: 'date',
    FILE: 'file',
    PHONE: 'phone',
};

async function create(conferenceId, fieldData) {
    const {
        field_name,
        field_type,
        field_label,
        field_options = null,
        placeholder = null,
        help_text = null,
        is_required = false,
        display_order = 0,
        validation_rules = null,
    } = fieldData;

    const query = {
        text: `
      INSERT INTO conference_registration_fields (
        conference_id, field_name, field_type, field_label, 
        field_options, placeholder, help_text, is_required, 
        display_order, validation_rules
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `,
        values: [
            conferenceId,
            field_name,
            field_type,
            field_label,
            field_options ? JSON.stringify(field_options) : null,
            placeholder,
            help_text,
            is_required,
            display_order,
            validation_rules ? JSON.stringify(validation_rules) : null,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function findByConferenceId(conferenceId) {
    const query = {
        text: `
      SELECT * FROM conference_registration_fields
      WHERE conference_id = $1
      ORDER BY display_order ASC, created_at ASC;
    `,
        values: [conferenceId],
    };

    const result = await database.query(query);
    return result.rows;
}

async function findById(fieldId, conferenceId = null) {
    const query = conferenceId
        ? {
              text: 'SELECT * FROM conference_registration_fields WHERE id = $1 AND conference_id = $2',
              values: [fieldId, conferenceId],
          }
        : {
              text: 'SELECT * FROM conference_registration_fields WHERE id = $1',
              values: [fieldId],
          };

    const result = await database.query(query);
    return result.rows[0];
}

async function update(fieldId, conferenceId, updateData) {
    const {
        field_name,
        field_type,
        field_label,
        field_options,
        placeholder,
        help_text,
        is_required,
        display_order,
        validation_rules,
    } = updateData;

    const query = {
        text: `
      UPDATE conference_registration_fields
      SET field_name = COALESCE($3, field_name),
          field_type = COALESCE($4, field_type),
          field_label = COALESCE($5, field_label),
          field_options = COALESCE($6, field_options),
          placeholder = COALESCE($7, placeholder),
          help_text = COALESCE($8, help_text),
          is_required = COALESCE($9, is_required),
          display_order = COALESCE($10, display_order),
          validation_rules = COALESCE($11, validation_rules),
          updated_at = (now() at time zone 'utc')
      WHERE id = $1 AND conference_id = $2
      RETURNING *;
    `,
        values: [
            fieldId,
            conferenceId,
            field_name,
            field_type,
            field_label,
            field_options ? JSON.stringify(field_options) : null,
            placeholder,
            help_text,
            is_required,
            display_order,
            validation_rules ? JSON.stringify(validation_rules) : null,
        ],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function deleteById(fieldId, conferenceId) {
    const query = {
        text: 'DELETE FROM conference_registration_fields WHERE id = $1 AND conference_id = $2 RETURNING *;',
        values: [fieldId, conferenceId],
    };

    const result = await database.query(query);
    return result.rows[0];
}

async function createDefaultFields(conferenceId) {
    const defaultFields = [
        {
            field_name: 'full_name',
            field_type: FIELD_TYPES.TEXT,
            field_label: 'Full Name',
            is_required: true,
            display_order: 1,
        },
        {
            field_name: 'affiliation',
            field_type: FIELD_TYPES.TEXT,
            field_label: 'Institution/Affiliation',
            is_required: true,
            display_order: 2,
        },
        {
            field_name: 'dietary_restrictions',
            field_type: FIELD_TYPES.MULTISELECT,
            field_label: 'Dietary Restrictions',
            field_options: [
                'None',
                'Vegetarian',
                'Vegan',
                'Gluten-Free',
                'Halal',
                'Kosher',
                'Other',
            ],
            display_order: 3,
        },
        {
            field_name: 'session_attendance',
            field_type: FIELD_TYPES.MULTISELECT,
            field_label: 'Which sessions will you attend?',
            field_options: [
                'All Sessions',
                'Keynotes Only',
                'Selected Sessions',
                'Workshops',
            ],
            is_required: true,
            display_order: 4,
        },
        {
            field_name: 'dinner_attendance',
            field_type: FIELD_TYPES.RADIO,
            field_label: 'Will you attend the conference dinner?',
            field_options: ['Yes', 'No'],
            is_required: true,
            display_order: 5,
        },
        {
            field_name: 'travel_info',
            field_type: FIELD_TYPES.TEXTAREA,
            field_label: 'Travel Information',
            placeholder: 'Arrival/departure dates, flight info, etc.',
            help_text:
                'Please provide your travel details if you need assistance',
            display_order: 6,
        },
    ];

    const createdFields = [];
    for (const field of defaultFields) {
        const created = await create(conferenceId, field);
        createdFields.push(created);
    }

    return createdFields;
}

export default Object.freeze({
    create,
    findByConferenceId,
    findById,
    update,
    deleteById,
    createDefaultFields,
    FIELD_TYPES,
});
