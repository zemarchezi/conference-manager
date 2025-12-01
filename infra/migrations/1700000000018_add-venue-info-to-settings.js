exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns('conference_settings', {
        venue_name: {
            type: 'varchar(255)',
        },
        venue_address: {
            type: 'text',
        },
        venue_city: {
            type: 'varchar(100)',
        },
        venue_country: {
            type: 'varchar(100)',
        },
        venue_map_url: {
            type: 'varchar(500)',
        },
        venue_directions: {
            type: 'text',
        },
        contact_email: {
            type: 'varchar(255)',
        },
        contact_phone: {
            type: 'varchar(50)',
        },
        social_twitter: {
            type: 'varchar(100)',
        },
        social_linkedin: {
            type: 'varchar(500)',
        },
        social_facebook: {
            type: 'varchar(500)',
        },
        registration_capacity: {
            type: 'integer',
            default: null,
        },
        enable_waitlist: {
            type: 'boolean',
            default: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('conference_settings', [
        'venue_name',
        'venue_address',
        'venue_city',
        'venue_country',
        'venue_map_url',
        'venue_directions',
        'contact_email',
        'contact_phone',
        'social_twitter',
        'social_linkedin',
        'social_facebook',
        'registration_capacity',
        'enable_waitlist',
    ]);
};
