import session from 'models/session.js';
import user from 'models/user.js';
import userConferenceRole from 'models/user-conference-role.js';

async function canRequest(feature, request) {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return false;
  }

  const sessionObj = await session.findOneValidByToken(sessionToken);

  if (!sessionObj) {
    return false;
  }

  const userObj = await user.findById(sessionObj.user_id);  // Changed from findOneById

  if (!userObj) {
    return false;
  }

  return userObj.features.includes(feature);
}

async function canRequestInConference(permission, conferenceId, request) {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return false;
  }

  const sessionObj = await session.findOneValidByToken(sessionToken);

  if (!sessionObj) {
    return false;
  }

  // Check if user has the permission in this specific conference
  return await userConferenceRole.hasPermission(
    sessionObj.user_id,
    conferenceId,
    permission
  );
}

async function getUserFromRequest(request) {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return null;
  }

  const sessionObj = await session.findOneValidByToken(sessionToken);

  if (!sessionObj) {
    return null;
  }

  return await user.findById(sessionObj.user_id);  // Changed from findOneById
}

async function getUserConferenceContext(request, conferenceId) {
  const currentUser = await getUserFromRequest(request);

  if (!currentUser) {
    return null;
  }

  const roles = await userConferenceRole.getUserRolesInConference(
    currentUser.id,
    conferenceId
  );

  const permissions = await userConferenceRole.getUserPermissionsInConference(
    currentUser.id,
    conferenceId
  );

  return {
    user: currentUser,
    roles: roles.map((r) => r.role),
    permissions,
  };
}

function getSessionToken(request) {
  const cookies = parseCookies(request.headers.cookie || '');
  return cookies.session_id;
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    cookies[parts[0].trim()] = parts[1];
  });
  return cookies;
}

export default Object.freeze({
  canRequest,
  canRequestInConference,
  getUserFromRequest,
  getUserConferenceContext,
});