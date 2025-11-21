exports.up = (pgm) => {
  // Composite indexes for efficient conference-scoped queries
  pgm.createIndex('abstracts', ['conference_id', 'author_id']);
  pgm.createIndex('abstracts', ['conference_id', 'status']);
  pgm.createIndex('abstracts', ['conference_id', 'created_at']);
  
  pgm.createIndex('reviews', ['abstract_id', 'reviewer_id']);
  
  pgm.createIndex('schedule_items', ['conference_id', 'start_time']);

  // Add check constraints to ensure data integrity
  pgm.sql(`
    ALTER TABLE abstracts 
    ADD CONSTRAINT check_conference_exists 
    CHECK (conference_id IS NOT NULL);
  `);

  pgm.sql(`
    ALTER TABLE schedule_items 
    ADD CONSTRAINT check_schedule_conference_exists 
    CHECK (conference_id IS NOT NULL);
  `);
};

exports.down = (pgm) => {
  pgm.dropIndex('abstracts', ['conference_id', 'author_id']);
  pgm.dropIndex('abstracts', ['conference_id', 'status']);
  pgm.dropIndex('abstracts', ['conference_id', 'created_at']);
  pgm.dropIndex('reviews', ['abstract_id', 'reviewer_id']);
  pgm.dropIndex('schedule_items', ['conference_id', 'start_time']);

  pgm.sql('ALTER TABLE abstracts DROP CONSTRAINT check_conference_exists;');
  pgm.sql('ALTER TABLE schedule_items DROP CONSTRAINT check_schedule_conference_exists;');
};