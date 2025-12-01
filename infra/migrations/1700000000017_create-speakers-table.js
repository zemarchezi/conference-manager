exports. shorthands = undefined;

exports. up = (pgm) => {
  // Create speakers table
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
      type: 'varchar(255)',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
    },
    organization: {
      type: 'varchar(255)',
    },
    bio: {
      type: 'text',
    },
    photo_url: {
      type: 'varchar(500)',
    },
    website: {
      type: 'varchar(500)',
    },
    twitter: {
      type: 'varchar(100)',
    },
    linkedin: {
      type: 'varchar(500)',
    },
    email: {
      type: 'varchar(255)',
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

  // Add indexes
  pgm.createIndex('speakers', 'conference_id');
  pgm.createIndex('speakers', 'is_keynote');
  pgm.createIndex('speakers', 'display_order');

  // Create trigger
  pgm.createTrigger('speakers', 'update_speakers_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });

  // Add speaker_id to schedule_items (optional - for linking talks to speakers)
  pgm. addColumn('schedule_items', {
    speaker_id: {
      type: 'uuid',
      references: 'speakers',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('schedule_items', 'speaker_id');
  pgm. dropTable('speakers');
};