exports.up = (pgm) => {
    pgm.addColumns('conference_registrations', {
        confirmation_code: {
            type: 'varchar(20)',
            unique: true,
        },
    });

    pgm.createIndex('conference_registrations', 'confirmation_code');
};

exports.down = (pgm) => {
    pgm.dropColumns('conference_registrations', ['confirmation_code']);
};
