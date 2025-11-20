import controller from 'models/abstract.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createAbstract(request, response);
  }

  if (request.method === 'GET') {
    return await listAbstracts(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createAbstract(request, response) {
  try {
    // Check authorization
    const canCreate = await authorization.canRequest('create:abstract', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to submit abstracts');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Validate abstract data
    if (!request.body.conference_id) {
      throw new validator.ValidationError([
        { field: 'conference_id', message: 'Conference ID is required' },
      ]);
    }

    if (!request.body.title || !request.body.content) {
      throw new validator.ValidationError([
        { field: 'title', message: 'Title is required' },
        { field: 'content', message: 'Content is required' },
      ]);
    }

    // Create abstract
    const abstractData = {
      conference_id: request.body.conference_id,
      author_id: currentUser.id,
      title: request.body.title,
      content: request.body.content,
      keywords: request.body.keywords || [],
    };

    const newAbstract = await controller.create(abstractData);

    return response.status(201).json(newAbstract);
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

    console.error('Error creating abstract:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function listAbstracts(request, response) {
  try {
    const { conference_id, author_id, status, limit, offset } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    if (conference_id) {
      options.conference_id = parseInt(conference_id);
    }

    if (author_id) {
      options.author_id = parseInt(author_id);
    }

    if (status) {
      options.status = status;
    }

    const abstracts = await controller.findAll(options);

    return response.status(200).json(abstracts);
  } catch (error) {
    console.error('Error listing abstracts:', error);
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