import controller from 'models/schedule.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === 'GET') {
    return await getSchedule(request, response, id);
  }

  if (request.method === 'PATCH') {
    return await updateSchedule(request, response, id);
  }

  if (request.method === 'DELETE') {
    return await deleteSchedule(request, response, id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getSchedule(request, response, scheduleId) {
  try {
    const schedule = await controller.findOneById(scheduleId);

    if (!schedule) {
      throw new validator.NotFoundError('Schedule entry not found');
    }

    return response.status(200).json(schedule);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error getting schedule:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateSchedule(request, response, scheduleId) {
  try {
    // Check authorization - only admins can update schedules
    const canUpdate = await authorization.canRequest('update:schedule', request);
    if (!canUpdate) {
      throw new validator.UnauthorizedError('User must be authenticated to update schedules');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    if (!currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('Only admins can update schedule entries');
    }

    // Get existing schedule
    const existingSchedule = await controller.findOneById(scheduleId);
    if (!existingSchedule) {
      throw new validator.NotFoundError('Schedule entry not found');
    }

    // Prepare update data
    const updateData = {};

    if (request.body.title !== undefined) {
      updateData.title = request.body.title;
    }

    if (request.body.description !== undefined) {
      updateData.description = request.body.description;
    }

    if (request.body.start_time !== undefined) {
      updateData.start_time = request.body.start_time;
    }

    if (request.body.end_time !== undefined) {
      updateData.end_time = request.body.end_time;
    }

    if (request.body.location !== undefined) {
      updateData.location = request.body.location;
    }

    if (request.body.abstract_id !== undefined) {
      updateData.abstract_id = request.body.abstract_id;
    }

    // Update schedule
    const updatedSchedule = await controller.update(scheduleId, updateData);

    return response.status(200).json(updatedSchedule);
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

    console.error('Error updating schedule:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function deleteSchedule(request, response, scheduleId) {
  try {
    // Check authorization - only admins can delete schedules
    const canDelete = await authorization.canRequest('delete:schedule', request);
    if (!canDelete) {
      throw new validator.UnauthorizedError('User must be authenticated to delete schedules');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    if (!currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('Only admins can delete schedule entries');
    }

    // Get existing schedule
    const existingSchedule = await controller.findOneById(scheduleId);
    if (!existingSchedule) {
      throw new validator.NotFoundError('Schedule entry not found');
    }

    // Delete schedule
    await controller.deleteById(scheduleId);

    return response.status(200).json({
      message: 'Schedule entry deleted successfully',
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

    console.error('Error deleting schedule:', error);
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