import database from 'infra/database.js';

const ROLES = {
  ORGANIZER: 'organizer',
  REVIEWER: 'reviewer',
  AUTHOR: 'author',
  ATTENDEE: 'attendee',
};

const ROLE_PERMISSIONS = {
  organizer: [
    'create:conference',
    'update:conference',
    'delete:conference',
    'read:conference',
    'assign:reviewer',
    'read:reviews',
    'read:abstracts',
    'update:abstract_status',
    'create:schedule',
    'update:schedule',
    'delete:schedule',
    'manage:members',
  ],
  reviewer: [
    'read:conference',
    'read:abstracts',
    'create:review',
    'update:review',
    'read:reviews',
  ],
  author: [
    'read:conference',
    'create:abstract',
    'update:abstract',
    'delete:abstract',
    'read:own_abstracts',
  ],
  attendee: [
    'read:conference',
    'read:schedule',
  ],
};

async function assignRole({ user_id, conference_id, role, custom_permissions = null }) {
  const permissions = custom_permissions || ROLE_PERMISSIONS[role] || [];

  const query = {
    text: `
      INSERT INTO user_conference_roles (user_id, conference_id, role, permissions)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, conference_id, role) 
      DO UPDATE SET 
        permissions = EXCLUDED.permissions,
        updated_at = (now() at time zone 'utc')
      RETURNING *;
    `,
    values: [user_id, conference_id, role, permissions],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function removeRole({ user_id, conference_id, role }) {
  const query = {
    text: `
      DELETE FROM user_conference_roles
      WHERE user_id = $1 AND conference_id = $2 AND role = $3
      RETURNING *;
    `,
    values: [user_id, conference_id, role],
  };

  const result = await database.query(query);
  return result.rows[0];
}

async function getUserRolesInConference(user_id, conference_id) {
  const query = {
    text: `
      SELECT * FROM user_conference_roles
      WHERE user_id = $1 AND conference_id = $2;
    `,
    values: [user_id, conference_id],
  };

  const result = await database.query(query);
  return result.rows;
}

async function getUserPermissionsInConference(user_id, conference_id) {
  const query = {
    text: `
      SELECT ARRAY_AGG(DISTINCT perm) as permissions
      FROM user_conference_roles, unnest(permissions) as perm
      WHERE user_id = $1 AND conference_id = $2;
    `,
    values: [user_id, conference_id],
  };

  const result = await database.query(query);
  return result.rows[0]?.permissions || [];
}

async function getConferenceMembers(conference_id) {
  const query = {
    text: `
      SELECT 
        ucr.*,
        u.username,
        u.email
      FROM user_conference_roles ucr
      JOIN users u ON ucr.user_id = u.id
      WHERE ucr.conference_id = $1
      ORDER BY ucr.created_at DESC;
    `,
    values: [conference_id],
  };

  const result = await database.query(query);
  return result.rows;
}

async function getUserConferences(user_id, role = null) {
  const query = role
    ? {
        text: `
          SELECT 
            c.*,
            ucr.role,
            ucr.permissions
          FROM user_conference_roles ucr
          JOIN conferences c ON ucr.conference_id = c.id
          WHERE ucr.user_id = $1 AND ucr.role = $2
          ORDER BY c.start_date DESC;
        `,
        values: [user_id, role],
      }
    : {
        text: `
          SELECT 
            c.*,
            ucr.role,
            ucr.permissions
          FROM user_conference_roles ucr
          JOIN conferences c ON ucr.conference_id = c.id
          WHERE ucr.user_id = $1
          ORDER BY c.start_date DESC;
        `,
        values: [user_id],
      };

  const result = await database.query(query);
  return result.rows;
}

async function hasPermission(user_id, conference_id, permission) {
  const permissions = await getUserPermissionsInConference(user_id, conference_id);
  return permissions.includes(permission);
}

export default Object.freeze({
  ROLES,
  ROLE_PERMISSIONS,
  assignRole,
  removeRole,
  getUserRolesInConference,
  getUserPermissionsInConference,
  getConferenceMembers,
  getUserConferences,
  hasPermission,
});