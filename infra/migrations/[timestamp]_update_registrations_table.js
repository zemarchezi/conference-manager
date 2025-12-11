exports.up = (pgm) => {
    // Add columns if they don't exist
    pgm.addColumns(
        'registrations',
        {
            confirmation_code: {
                type: 'varchar(20)',
            },
            registration_type: {
                type: 'varchar(50)',
                default: 'regular',
            },
            status: {
                type: 'varchar(50)',
                default: 'pending',
                notNull: true,
            },
        },
        {
            ifNotExists: true,
        },
    );

    // Add index for confirmation code
    pgm.createIndex('registrations', 'confirmation_code', {
        ifNotExists: true,
    });

    // Add unique constraint
    pgm.addConstraint(
        'registrations',
        'unique_confirmation_code',
        {
            unique: ['confirmation_code'],
        },
        {
            ifNotExists: true,
        },
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint('registrations', 'unique_confirmation_code', {
        ifExists: true,
    });
    pgm.dropIndex('registrations', 'confirmation_code', {
        ifExists: true,
    });
    pgm.dropColumns(
        'registrations',
        ['confirmation_code', 'registration_type', 'status'],
        {
            ifExists: true,
        },
    );
};
