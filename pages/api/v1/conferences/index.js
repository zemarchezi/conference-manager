import controller from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createConference(request, response);
  }

  if (request.method === 'GET') {
    return await listConferences(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createConference(request, response) {
  try {
    // Check authorization
    const canCreate = await authorization.canRequest('create:conference', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to create conferences');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Validate conference data
    if (!request.body.title || !request.body.description) {
      throw new validator.ValidationError([
        { field: 'title', message: 'Title is required' },
        { field: 'description', message: 'Description is required' },
      ]);
    }

    if (!request.body.start_date || !request.body.end_date) {
      throw new validator.ValidationError([
        { field: 'start_date', message: 'Start date is required' },
        { field: 'end_date', message: 'End date is required' },
      ]);
    }

    // Create conference
    const conferenceData = {
      title: request.body.title,
      description: request.body.description,
      start_date: request.body.start_date,
      end_date: request.body.end_date,
      location: request.body.location || '',
      organizer_id: currentUser.id,
    };

    const newConference = await controller.create(conferenceData);

    return response.status(201).json(newConference);
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

    console.error('Error creating conference:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function listConferences(request, response) {
  try {
    const { limit, offset, status, organizer_id } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    if (status) {
      options.status = status;
    }

    if (organizer_id) {
      options.organizer_id = parseInt(organizer_id);
    }

    const conferences = await controller.findAll(options);

    return response.status(200).json(conferences);
  } catch (error) {
    console.error('Error listing conferences:', error);
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