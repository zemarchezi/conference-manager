import abstract from 'models/abstract.js';
import conference from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id, id } = request.query;

  // Verify conference exists
  const conf = await conference.findOneById(conference_id);
  if (!conf) {
    return response.status(404).json({ error: 'Conference not found' });
  }

  if (request.method === 'GET') {
    return await getAbstract(request, response, conference_id, id);
  }

  if (request.method === 'PATCH') {
    return await updateAbstract(request, response, conference_id, id);
  }

  if (request.method === 'DELETE') {
    return await deleteAbstract(request, response, conference_id, id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getAbstract(request, response, conference_id, id) {
  try {
    const canRead = await authorization.canRequestInConference(
      'read:abstracts',
      conference_id,
      request
    );

    if (!canRead) {
      return response.status(403).json({
        error: 'You do not have permission to view this abstract',
      });
    }

    // Fetch abstract with conference context enforcement
    const abstractData = await abstract.findOneById(id, conference_id);

    if (!abstractData) {
      return response.status(404).json({ error: 'Abstract not found in this conference' });
    }

    return response.status(200).json(abstractData);
  } catch (error) {
    console.error('Error fetching abstract:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function updateAbstract(request, response, conference_id, id) {
  try {
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch abstract to check ownership
    const existingAbstract = await abstract.findOneById(id, conference_id);

    if (!existingAbstract) {
      return response.status(404).json({ error: 'Abstract not found in this conference' });
    }

    // Check if user is the author or has permission to update
    const isAuthor = existingAbstract.author_id === currentUser.id;
    const canUpdate = await authorization.canRequestInConference(
      'update:abstract_status',
      conference_id,
      request
    );

    if (!isAuthor && !canUpdate) {
      return response.status(403).json({
        error: 'You do not have permission to update this abstract',
      });
    }

    const updateData = {};
    if (request.body.title) updateData.title = request.body.title;
    if (request.body.content) updateData.content = request.body.content;
    if (request.body.keywords) updateData.keywords = request.body.keywords;
    if (request.body.status && canUpdate) updateData.status = request.body.status;

    const updatedAbstract = await abstract.update(id, conference_id, updateData);

    return response.status(200).json(updatedAbstract);
  } catch (error) {
    console.error('Error updating abstract:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteAbstract(request, response, conference_id, id) {
  try {
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const existingAbstract = await abstract.findOneById(id, conference_id);

    if (!existingAbstract) {
      return response.status(404).json({ error: 'Abstract not found in this conference' });
    }

    const isAuthor = existingAbstract.author_id === currentUser.id;
    const canDelete = await authorization.canRequestInConference(
      'delete:abstract',
      conference_id,
      request
    );

    if (!isAuthor && !canDelete) {
      return response.status(403).json({
        error: 'You do not have permission to delete this abstract',
      });
    }

    await abstract.deleteById(id, conference_id);

    return response.status(200).json({ message: 'Abstract deleted successfully' });
  } catch (error) {
    console.error('Error deleting abstract:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}