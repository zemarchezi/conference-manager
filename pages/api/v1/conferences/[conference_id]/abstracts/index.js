import abstract from 'models/abstract.js';
import conference from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import userConferenceRole from 'models/user-conference-role.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  // Verify conference exists
  const conf = await conference.findOneById(conference_id);
  if (!conf) {
    return response.status(404).json({ error: 'Conference not found' });
  }

  if (request.method === 'POST') {
    return await createAbstract(request, response, conference_id);
  }

  if (request.method === 'GET') {
    return await listAbstracts(request, response, conference_id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createAbstract(request, response, conference_id) {
  try {
    // Check if user has permission to create abstracts in this conference
    const canCreate = await authorization.canRequestInConference(
      'create:abstract',
      conference_id,
      request
    );

    if (!canCreate) {
      return response.status(403).json({
        error: 'You do not have permission to submit abstracts to this conference',
      });
    }

    // Get current user
    const currentUser = await authorization.getUserFromRequest(request);

    // Validate abstract data
    if (!request.body.title || !request.body.content) {
      throw new validator.ValidationError([
        { field: 'title', message: 'Title is required' },
        { field: 'content', message: 'Content is required' },
      ]);
    }

    const abstractData = {
      conference_id,
      author_id: currentUser.id,
      title: request.body.title,
      content: request.body.content,
      keywords: request.body.keywords || [],
      status: 'submitted',
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

    console.error('Error creating abstract:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listAbstracts(request, response, conference_id) {
  try {
    // Check if user has permission to read abstracts in this conference
    const canRead = await authorization.canRequestInConference(
      'read:abstracts',
      conference_id,
      request
    );

    if (!canRead) {
      return response.status(403).json({
        error: 'You do not have permission to view abstracts for this conference',
      });
    }

    const { limit, offset, status, author_id } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    if (status) {
      options.status = status;
    }

    if (author_id) {
      options.author_id = author_id;
    }

    // All abstracts are automatically scoped to conference_id
    const abstracts = await abstract.findAll(conference_id, options);

    return response.status(200).json(abstracts);
  } catch (error) {
    console.error('Error listing abstracts:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}