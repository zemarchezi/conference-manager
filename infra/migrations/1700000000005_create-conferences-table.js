exports.up = (pgm) => {
  pgm.createTable('conferences', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    title: {
      type: 'varchar(200)',
      notNull: true,
    },
    slug: {
      type: 'varchar(200)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    location: {
      type: 'varchar(200)',
    },
    start_date: {
      type: 'date',
      notNull: true,
    },
    end_date: {
      type: 'date',
      notNull: true,
    },
    submission_deadline: {
      type: 'date',
    },
    organizer_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL',
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

  pgm.createIndex('conferences', 'slug');
  pgm.createIndex('conferences', 'start_date');
  pgm.createIndex('conferences', 'organizer_id');
};

exports.down = (pgm) => {
  pgm.dropTable('conferences');
};
