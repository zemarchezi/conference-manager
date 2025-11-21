exports.up = (pgm) => {
  // Add organization_id column to conferences
  pgm.addColumn('conferences', {
    organization_id: {
      type: 'uuid',
      references: 'organizations(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.createIndex('conferences', 'organization_id');

  // Add constraint to ensure conference belongs to organization
  pgm.addConstraint('conferences', 'conference_organization_check', {
    check: 'organization_id IS NOT NULL OR organizer_id IS NOT NULL',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('conferences', 'conference_organization_check');
  pgm.dropColumn('conferences', 'organization_id');
};