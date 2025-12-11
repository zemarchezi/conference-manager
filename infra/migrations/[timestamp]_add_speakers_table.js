exports.up = (pgm) => {
    pgm.createTable('speakers', {
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
        name: {
            type: 'varchar(200)',
            notNull: true,
        },
        title: {
            type: 'varchar(200)',
        },
        organization: {
            type: 'varchar(200)',
        },
        bio: {
            type: 'text',
        },
        photo_url: {
            type: 'text',
        },
        website: {
            type: 'text',
        },
        twitter: {
            type: 'varchar(100)',
        },
        linkedin: {
            type: 'text',
        },
        is_keynote: {
            type: 'boolean',
            default: false,
        },
        display_order: {
            type: 'integer',
            default: 0,
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

    pgm.createIndex('speakers', 'conference_id');
    pgm.createIndex('speakers', ['conference_id', 'is_keynote']);
    pgm.createIndex('speakers', ['conference_id', 'display_order']);
};

exports.down = (pgm) => {
    pgm.dropTable('speakers');
};
