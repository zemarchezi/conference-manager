import schedule from 'models/schedule.js';
import conference from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  const conf = await conference.findOneById(conference_id);
  if (!conf) {
    return response.status(404).json({ error: 'Conference not found' });
  }

  if (request.method === 'POST') {
    return await createScheduleItem(request, response, conference_id);
  }

  if (request.method === 'GET') {
    return await listScheduleItems(request, response, conference_id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createScheduleItem(request, response, conference_id) {
  try {
    const canCreate = await authorization.canRequestInConference(
      'create:schedule',
      conference_id,
      request
    );

    if (!canCreate) {
      return response.status(403).json({
        error: 'You do not have permission to create schedule items for this conference',
      });
    }

    if (!request.body.title || !request.body.start_time || !request.body.end_time) {
      throw new validator.ValidationError([
        { field: 'title', message: 'Title is required' },
        { field: 'start_time', message: 'Start time is required' },
        { field: 'end_time', message: 'End time is required' },
      ]);
    }

    const scheduleData = {
      title: request.body.title,
      description: request.body.description || '',
      start_time: request.body.start_time,
      end_time: request.body.end_time,
      location: request.body.location || '',
      speaker: request.body.speaker || '',
    };

    const newScheduleItem = await schedule.create(conference_id, scheduleData);

    return response.status(201).json(newScheduleItem);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    console.error('Error creating schedule item:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listScheduleItems(request, response, conference_id) {
  try {
    // Check if schedule is public or user has permission
    const conf = await conference.findOneById(conference_id);
    const settings = await conferenceSettings.findByConferenceId(conference_id);

    const isPublic = settings?.enable_public_schedule !== false;
    const hasPermission = await authorization.canRequestInConference(
      'read:schedule',
      conference_id,
      request
    );

    if (!isPublic && !hasPermission) {
      return response.status(403).json({
        error: 'This conference schedule is not public',
      });
    }

    const { limit, offset } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };

    const scheduleItems = await schedule.findAll(conference_id, options);

    return response.status(200).json(scheduleItems);
  } catch (error) {
    console.error('Error listing schedule items:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}