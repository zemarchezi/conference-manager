import controller from 'models/schedule.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createSchedule(request, response);
  }

  if (request.method === 'GET') {
    return await listSchedules(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createSchedule(request, response) {
  try {
    // Check authorization - only admins can create schedules
    const canCreate = await authorization.canRequest('create:schedule', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to create schedules');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    if (!currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('Only admins can create schedule entries');
    }

    // Validate schedule data
    if (!request.body.conference_id) {
      throw new validator.ValidationError([
        { field: 'conference_id', message: 'Conference ID is required' },
      ]);
    }

    if (!request.body.title || !request.body.start_time || !request.body.end_time) {
      throw new validator.ValidationError([
        { field: 'title', message: 'Title is required' },
        { field: 'start_time', message: 'Start time is required' },
        { field: 'end_time', message: 'End time is required' },
      ]);
    }

    // Create schedule
    const scheduleData = {
      conference_id: request.body.conference_id,
      abstract_id: request.body.abstract_id || null,
      title: request.body.title,
      description: request.body.description || '',
      start_time: request.body.start_time,
      end_time: request.body.end_time,
      location: request.body.location || '',
    };

    const newSchedule = await controller.create(scheduleData);

    return response.status(201).json(newSchedule);
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

    if (error.name === 'ForbiddenError') {
      return response.status(403).json({
        error: error.message,
      });
    }

    console.error('Error creating schedule:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function listSchedules(request, response) {
  try {
    const { conference_id, limit, offset } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };

    if (conference_id) {
      options.conference_id = parseInt(conference_id);
    }

    const schedules = await controller.findAll(options);

    return response.status(200).json(schedules);
  } catch (error) {
    console.error('Error listing schedules:', error);
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