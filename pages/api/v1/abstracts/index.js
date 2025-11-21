import abstract from 'models/abstract.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';

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
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

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

    const newAbstract = await abstract.create(abstractData);

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

    // If no conference_id provided, return empty array or error
    if (!conference_id) {
      return response.status(400).json({
        error: 'conference_id is required',
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    if (author_id) {
      options.author_id = author_id;
    }

    if (status) {
      options.status = status;
    }

    // Use the refactored findAll that requires conference_id
    const abstracts = await abstract.findAll(conference_id, options);

    return response.status(200).json(abstracts);
  } catch (error) {
    console.error('Error listing abstracts:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}