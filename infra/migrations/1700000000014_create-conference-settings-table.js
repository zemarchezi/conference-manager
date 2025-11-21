export function up(pgm) {
  pgm.createTable('conference_settings', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    conference_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'conferences(id)',
      onDelete: 'CASCADE',
    },
    // Branding settings
    logo_url: {
      type: 'text',
    },
    primary_color: {
      type: 'varchar(7)',
      default: '#3b82f6',
    },
    secondary_color: {
      type: 'varchar(7)',
      default: '#1e40af',
    },
    custom_css: {
      type: 'text',
    },
    // Submission settings
    abstract_max_length: {
      type: 'integer',
      default: 5000,
    },
    keywords_required: {
      type: 'boolean',
      default: false,
    },
    custom_fields: {
      type: 'jsonb',
      default: '[]',
    },
    // Feature toggles
    enable_reviews: {
      type: 'boolean',
      default: true,
    },
    enable_public_schedule: {
      type: 'boolean',
      default: true,
    },
    enable_abstract_submission: {
      type: 'boolean',
      default: true,
    },
    // Email settings
    custom_email_templates: {
      type: 'jsonb',
      default: '{}',
    },
    notification_email: {
      type: 'varchar(254)',
    },
    // Metadata
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

  pgm.createIndex('conference_settings', 'conference_id');
}

export function down(pgm) {
  pgm.dropTable('conference_settings');
}
