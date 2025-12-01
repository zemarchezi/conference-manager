import registration from 'models/registration.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  if (request.method === 'GET') {
    return await getMyRegistration(request, response, conference_id);
  }

  if (request.method === 'DELETE') {
    return await cancelMyRegistration(request, response, conference_id);
  }

  return response.status(405). json({ error: 'Method not allowed' });
}

async function getMyRegistration(request, response, conferenceId) {
  try {
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'Authentication required' });
    }

    const conferenceData = await conference.findOneById(conferenceId);
    if (!conferenceData) {
      return response.status(404). json({ error: 'Conference not found' });
    }

    const myRegistration = await registration.findByUserAndConference(
      currentUser.id,
      conferenceId
    );

    if (! myRegistration) {
      return response.status(404).json({ error: 'Registration not found' });
    }

    return response.status(200). json(myRegistration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    return response. status(500).json({ error: 'Internal server error' });
  }
}

async function cancelMyRegistration(request, response, conferenceId) {
  try {
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'Authentication required' });
    }

    const myRegistration = await registration.findByUserAndConference(
      currentUser.id,
      conferenceId
    );

    if (! myRegistration) {
      return response.status(404).json({ error: 'Registration not found' });
    }

    const cancelled = await registration.cancelRegistration(myRegistration.id);

    return response.status(200). json({ 
      message: 'Registration cancelled successfully',
      registration: cancelled,
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}