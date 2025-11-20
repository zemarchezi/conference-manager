import session from 'models/session.js';
import user from 'models/user.js';

async function canRequest(feature, request) {
  const sessionToken = getSessionToken(request);

  if (!sessionToken) {
    return false;
  }

  const sessionObj = await session.findOneValidByToken(sessionToken);

  if (!sessionObj) {
    return false;
  }

  const userObj = await user.findOneById(sessionObj.user_id);

  if (!userObj) {
    return false;
  }

  return userObj.features.includes(feature);
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
});
