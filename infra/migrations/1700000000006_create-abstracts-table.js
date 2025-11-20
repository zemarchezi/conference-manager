exports.up = (pgm) => {
  pgm.createTable('abstracts', {
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
    author_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'varchar(300)',
      notNull: true,
    },
    content: {
      type: 'text',
      notNull: true,
    },
    keywords: {
      type: 'text[]',
      default: '{}',
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
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

  pgm.createIndex('abstracts', 'conference_id');
  pgm.createIndex('abstracts', 'author_id');
  pgm.createIndex('abstracts', 'status');
};

exports.down = (pgm) => {
  pgm.dropTable('abstracts');
};
