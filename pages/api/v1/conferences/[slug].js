import controller from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  const { slug } = request.query;

  if (request.method === 'GET') {
    return await getConference(request, response, slug);
  }

  if (request.method === 'PATCH') {
    return await updateConference(request, response, slug);
  }

  if (request.method === 'DELETE') {
    return await deleteConference(request, response, slug);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getConference(request, response, slug) {
  try {
    const conference = await controller.findOneBySlug(slug);

    if (!conference) {
      throw new validator.NotFoundError('Conference not found');
    }

    return response.status(200).json(conference);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error getting conference:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateConference(request, response, slug) {
  try {
    // Check authorization
    const canUpdate = await authorization.canRequest('update:conference', request);
    if (!canUpdate) {
      throw new validator.UnauthorizedError('User must be authenticated to update conferences');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Get existing conference
    const existingConference = await controller.findOneBySlug(slug);
    if (!existingConference) {
      throw new validator.NotFoundError('Conference not found');
    }

    // Check if user is organizer or admin
    if (existingConference.organizer_id !== currentUser.id && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only update conferences you organized');
    }

    // Prepare update data
    const updateData = {};

    if (request.body.title !== undefined) {
      updateData.title = request.body.title;
    }

    if (request.body.description !== undefined) {
      updateData.description = request.body.description;
    }

    if (request.body.start_date !== undefined) {
      updateData.start_date = request.body.start_date;
    }

    if (request.body.end_date !== undefined) {
      updateData.end_date = request.body.end_date;
    }

    if (request.body.location !== undefined) {
      updateData.location = request.body.location;
    }

    if (request.body.status !== undefined) {
      // Validate status
      if (!['upcoming', 'ongoing', 'completed', 'cancelled'].includes(request.body.status)) {
        throw new validator.ValidationError([{
          field: 'status',
          message: 'Status must be one of: upcoming, ongoing, completed, cancelled',
        }]);
      }
      updateData.status = request.body.status;
    }

    // Update conference
    const updatedConference = await controller.update(existingConference.id, updateData);

    return response.status(200).json(updatedConference);
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

    console.error('Error updating conference:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function deleteConference(request, response, slug) {
  try {
    // Check authorization
    const canDelete = await authorization.canRequest('delete:conference', request);
    if (!canDelete) {
      throw new validator.UnauthorizedError('User must be authenticated to delete conferences');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Get existing conference
    const existingConference = await controller.findOneBySlug(slug);
    if (!existingConference) {
      throw new validator.NotFoundError('Conference not found');
    }

    // Check if user is organizer or admin
    if (existingConference.organizer_id !== currentUser.id && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only delete conferences you organized');
    }

    // Delete conference
    await controller.deleteById(existingConference.id);

    return response.status(200).json({
      message: 'Conference deleted successfully',
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

    console.error('Error deleting conference:', error);
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