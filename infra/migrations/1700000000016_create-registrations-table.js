exports.shorthands = undefined;

exports.up = (pgm) => {
    // Create update_updated_at_column function if it doesn't exist
    pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW. updated_at = (now() at time zone 'utc');
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

    // Create registrations table
    pgm.createTable('registrations', {
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
        status: {
            type: 'varchar(50)',
            notNull: true,
            default: 'pending',
        },
        registration_type: {
            type: 'varchar(50)',
            notNull: true,
            default: 'regular',
        },
        attended: {
            type: 'boolean',
            default: false,
        },
        registration_data: {
            type: 'jsonb',
            default: '{}',
        },
        payment_status: {
            type: 'varchar(50)',
            default: 'not_required',
        },
        payment_amount: {
            type: 'decimal(10, 2)',
            default: 0,
        },
        confirmation_code: {
            type: 'varchar(100)',
            unique: true,
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

    // Add indexes
    pgm.createIndex('registrations', 'conference_id');
    pgm.createIndex('registrations', 'user_id');
    pgm.createIndex('registrations', 'status');
    pgm.createIndex('registrations', 'confirmation_code');

    // Add unique constraint: one user can only register once per conference
    pgm.createConstraint('registrations', 'unique_user_conference', {
        unique: ['user_id', 'conference_id'],
    });

    // Create updated_at trigger
    pgm.createTrigger('registrations', 'update_registrations_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        function: 'update_updated_at_column',
        level: 'ROW',
    });
};

exports.down = (pgm) => {
    pgm.dropTable('registrations');
};
