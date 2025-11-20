import controller from 'models/user.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';

export default async function handler(request, response) {
  const { username } = request.query;

  if (request.method === 'GET') {
    return await getUser(request, response, username);
  }

  if (request.method === 'PATCH') {
    return await updateUser(request, response, username);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getUser(request, response, username) {
  try {
    const user = await controller.findOneByUsername(username);

    if (!user) {
      throw new validator.NotFoundError('User not found');
    }

    delete user.password;
    return response.status(200).json(user);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return response.status(404).json({ error: error.message });
    }

    console.error('Error getting user:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function updateUser(request, response, username) {
  try {
    const canUpdate = await authorization.canRequest('update:user', request);
    if (!canUpdate) {
      throw new validator.UnauthorizedError('User must be authenticated');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await controller.findOneById(sessionObj.user_id);

    if (currentUser.username !== username && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only update your own profile');
    }

    const userToUpdate = await controller.findOneByUsername(username);
    if (!userToUpdate) {
      throw new validator.NotFoundError('User not found');
    }

    const updateData = {};
    if (request.body.email) updateData.email = request.body.email;
    if (request.body.password) updateData.password = request.body.password;

    const updatedUser = await controller.update(userToUpdate.id, updateData);
    delete updatedUser.password;

    return response.status(200).json(updatedUser);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return response.status(statusCode).json({ error: error.message });
  }
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