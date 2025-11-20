exports.up = (pgm) => {
  pgm.createTable('schedule_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    conference_id: {
      type: 'uuid',
      notNull: true,
      references: 'conferences(id)',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    start_time: {
      type: 'timestamp',
      notNull: true,
    },
    end_time: {
      type: 'timestamp',
      notNull: true,
    },
    location: {
      type: 'varchar(200)',
    },
    speaker: {
      type: 'varchar(200)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('schedule_items', 'conference_id');
  pgm.createIndex('schedule_items', 'start_time');
};

exports.down = (pgm) => {
  pgm.dropTable('schedule_items');
};
