exports.up = (pgm) => {
    // Table for storing custom registration form fields
    pgm.createTable('conference_registration_fields', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        conference_id: {
            type: 'uuid',
            notNull: true,
            references: 'conferences',
            onDelete: 'CASCADE',
        },
        field_name: {
            type: 'varchar(100)',
            notNull: true,
        },
        field_type: {
            type: 'varchar(50)',
            notNull: true,
            // text, textarea, email, number, select, multiselect, checkbox, radio, date, file
        },
        field_label: {
            type: 'varchar(200)',
            notNull: true,
        },
        field_options: {
            type: 'jsonb',
            // For select/radio/checkbox options:  ["Option 1", "Option 2"]
        },
        placeholder: {
            type: 'varchar(200)',
        },
        help_text: {
            type: 'text',
        },
        is_required: {
            type: 'boolean',
            default: false,
        },
        display_order: {
            type: 'integer',
            notNull: true,
            default: 0,
        },
        validation_rules: {
            type: 'jsonb',
            // { min: 5, max: 100, pattern: "regex", etc }
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("(now() at time zone 'utc')"),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("(now() at time zone 'utc')"),
        },
    });

    // Table for storing actual registrations
    pgm.createTable('conference_registrations', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        conference_id: {
            type: 'uuid',
            notNull: true,
            references: 'conferences',
            onDelete: 'CASCADE',
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: 'users',
            onDelete: 'CASCADE',
        },
        registration_data: {
            type: 'jsonb',
            notNull: true,
            // Stores all form responses:  { "field_name": "value", ...  }
        },
        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'pending',
            // pending, confirmed, cancelled, waitlist
        },
        payment_status: {
            type: 'varchar(50)',
            default: 'unpaid',
            // unpaid, paid, refunded
        },
        payment_amount: {
            type: 'decimal(10,2)',
        },
        notes: {
            type: 'text',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("(now() at time zone 'utc')"),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func("(now() at time zone 'utc')"),
        },
    });

    // Indexes
    pgm.createIndex('conference_registration_fields', 'conference_id');
    pgm.createIndex('conference_registration_fields', [
        'conference_id',
        'display_order',
    ]);
    pgm.createIndex('conference_registrations', 'conference_id');
    pgm.createIndex('conference_registrations', 'user_id');
    pgm.createIndex('conference_registrations', ['conference_id', 'user_id']);
    pgm.createIndex('conference_registrations', 'status');

    // Unique constraint:  one registration per user per conference
    pgm.addConstraint(
        'conference_registrations',
        'unique_user_conference_registration',
        {
            unique: ['conference_id', 'user_id'],
        },
    );
};

exports.down = (pgm) => {
    pgm.dropTable('conference_registrations');
    pgm.dropTable('conference_registration_fields');
};
