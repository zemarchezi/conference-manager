exports.up = (pgm) => {
  pgm.sql(`
    UPDATE users 
    SET features = array_cat(features, ARRAY[
      'read:user',
      'update:user',
      'create:conference',
      'create:abstract',
      'create:review'
    ]::text[])
    WHERE NOT ('create:conference' = ANY(features));
  `);
};

exports.down = (pgm) => {
  // Optionally remove these features
  pgm.sql(`
    UPDATE users 
    SET features = ARRAY['read:activation_token']::text[];
  `);
};