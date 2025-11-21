exports.up = (pgm) => {
  pgm.createTable('user_conference_roles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    conference_id: {
      type: 'uuid',
      notNull: true,
      references: 'conferences(id)',
      onDelete: 'CASCADE',
    },
    role: {
      type: 'varchar(50)',
      notNull: true,
      // Possible roles: 'organizer', 'reviewer', 'author', 'attendee'
    },
    permissions: {
      type: 'text[]',
      notNull: true,
      default: '{}',
      // Granular permissions like: 'create:abstract', 'read:reviews', 'assign:reviewer'
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

  // Ensure unique user-conference-role combination
  pgm.addConstraint('user_conference_roles', 'unique_user_conference_role', {
    unique: ['user_id', 'conference_id', 'role'],
  });

  pgm.createIndex('user_conference_roles', 'user_id');
  pgm.createIndex('user_conference_roles', 'conference_id');
  pgm.createIndex('user_conference_roles', ['user_id', 'conference_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('user_conference_roles');
};