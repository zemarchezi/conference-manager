exports.up = (pgm) => {
  pgm.createTable('organizations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
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
    owner_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    settings: {
      type: 'jsonb',
      default: '{}',
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('(now() at time zone \'utc\')'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('(now() at time zone \'utc\')'),
    },
  });

  pgm.createIndex('organizations', 'slug');
  pgm.createIndex('organizations', 'owner_id');
};

exports.down = (pgm) => {
  pgm.dropTable('organizations');
};