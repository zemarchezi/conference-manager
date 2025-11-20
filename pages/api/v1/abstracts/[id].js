import controller from 'models/abstract.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === 'GET') {
    return await getAbstract(request, response, id);
  }

  if (request.method === 'PATCH') {
    return await updateAbstract(request, response, id);
  }

  if (request.method === 'DELETE') {
    return await deleteAbstract(request, response, id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getAbstract(request, response, abstractId) {
  try {
    const abstract = await controller.findOneById(abstractId);

    if (!abstract) {
      throw new validator.NotFoundError('Abstract not found');
    }

    return response.status(200).json(abstract);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error getting abstract:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateAbstract(request, response, abstractId) {
  try {
    // Check authorization
    const canUpdate = await authorization.canRequest('update:abstract', request);
    if (!canUpdate) {
      throw new validator.UnauthorizedError('User must be authenticated to update abstracts');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Get existing abstract
    const existingAbstract = await controller.findOneById(abstractId);
    if (!existingAbstract) {
      throw new validator.NotFoundError('Abstract not found');
    }

    // Check if user is author or admin
    if (existingAbstract.author_id !== currentUser.id && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only update your own abstracts');
    }

    // Prepare update data
    const updateData = {};

    if (request.body.title !== undefined) {
      updateData.title = request.body.title;
    }

    if (request.body.content !== undefined) {
      updateData.content = request.body.content;
    }

    if (request.body.keywords !== undefined) {
      updateData.keywords = request.body.keywords;
    }

    if (request.body.status !== undefined) {
      // Validate status
      if (!['submitted', 'under_review', 'accepted', 'rejected'].includes(request.body.status)) {
        throw new validator.ValidationError([{
          field: 'status',
          message: 'Status must be one of: submitted, under_review, accepted, rejected',
        }]);
      }
      // Only admins can change status
      if (!currentUser.features.includes('admin')) {
        throw new validator.ForbiddenError('Only admins can change abstract status');
      }
      updateData.status = request.body.status;
    }

    // Update abstract
    const updatedAbstract = await controller.update(abstractId, updateData);

    return response.status(200).json(updatedAbstract);
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

    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error updating abstract:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function deleteAbstract(request, response, abstractId) {
  try {
    // Check authorization
    const canDelete = await authorization.canRequest('delete:abstract', request);
    if (!canDelete) {
      throw new validator.UnauthorizedError('User must be authenticated to delete abstracts');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Get existing abstract
    const existingAbstract = await controller.findOneById(abstractId);
    if (!existingAbstract) {
      throw new validator.NotFoundError('Abstract not found');
    }

    // Check if user is author or admin
    if (existingAbstract.author_id !== currentUser.id && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only delete your own abstracts');
    }

    // Delete abstract
    await controller.deleteById(abstractId);

    return response.status(200).json({
      message: 'Abstract deleted successfully',
    });
  } catch (error) {
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

    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error deleting abstract:', error);
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