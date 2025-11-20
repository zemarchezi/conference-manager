exports.up = (pgm) => {
  pgm.addColumn('conferences', {
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'upcoming',
    },
  });

  pgm.createIndex('conferences', 'status');
};

exports.down = (pgm) => {
  pgm.dropColumn('conferences', 'status');
};
