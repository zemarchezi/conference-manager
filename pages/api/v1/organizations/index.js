import organization from 'models/organization.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createOrganization(request, response);
  }

  if (request.method === 'GET') {
    return await listOrganizations(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createOrganization(request, response) {
  try {
    // Check authorization
    const canCreate = await authorization.canRequest('create:user', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to create organizations');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findById(sessionObj.user_id);

    // Validate organization data
    if (!request.body.name) {
      throw new validator.ValidationError([
        { field: 'name', message: 'Organization name is required' },
      ]);
    }

    const organizationData = {
      name: request.body.name,
      description: request.body.description || '',
      owner_id: currentUser.id,
      settings: request.body.settings || {},
    };

    const newOrganization = await organization.create(organizationData);

    return response.status(201).json(newOrganization);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    if (error.name === 'UnauthorizedError') {
      return response.status(401).json({
        error: error.message,
      });
    }

    console.error('Error creating organization:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function listOrganizations(request, response) {
  try {
    const canRead = await authorization.canRequest('read:user', request);
    if (!canRead) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findById(sessionObj.user_id);

    const organizations = await organization.findByOwnerId(currentUser.id);

    return response.status(200).json(organizations);
  } catch (error) {
    console.error('Error listing organizations:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
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