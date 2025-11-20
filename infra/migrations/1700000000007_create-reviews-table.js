exports.up = (pgm) => {
  pgm.createTable('reviews', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    abstract_id: {
      type: 'uuid',
      notNull: true,
      references: 'abstracts(id)',
      onDelete: 'CASCADE',
    },
    reviewer_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    score: {
      type: 'integer',
      notNull: true,
    },
    comments: {
      type: 'text',
    },
    recommendation: {
      type: 'varchar(20)',
      notNull: true,
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

  pgm.createIndex('reviews', 'abstract_id');
  pgm.createIndex('reviews', 'reviewer_id');
  pgm.addConstraint('reviews', 'unique_review_per_abstract', {
    unique: ['abstract_id', 'reviewer_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('reviews');
};
