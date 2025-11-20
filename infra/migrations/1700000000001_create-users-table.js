exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    username: {
      type: 'varchar(30)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(254)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'varchar(200)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    features: {
      type: 'text[]',
      notNull: true,
      default: pgm.func("ARRAY['read:activation_token']"),
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

  pgm.createIndex('users', 'username');
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};