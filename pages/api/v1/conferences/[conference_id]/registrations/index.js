import registration from 'models/registration.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  if (request.method === 'GET') {
    return await listRegistrations(request, response, conference_id);
  }

  if (request.method === 'POST') {
    return await createRegistration(request, response, conference_id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createRegistration(request, response, conferenceId) {
  try {
    // Get current user
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401).json({ error: 'User must be authenticated to register' });
    }

    // Check if conference exists
    const conferenceData = await conference.findOneById(conferenceId);
    if (!conferenceData) {
      return response.status(404).json({ error: 'Conference not found' });
    }

    // Check if user is already registered
    const existingRegistration = await registration.findByUserAndConference(
      currentUser.id,
      conferenceId
    );

    if (existingRegistration) {
      return response.status(400).json({ 
        error: 'You are already registered for this conference',
        registration: existingRegistration,
      });
    }

    // Create registration
    const registrationData = {
      conference_id: conferenceId,
      user_id: currentUser.id,
      registration_type: request.body.registration_type || 'regular',
      registration_data: request.body.registration_data || {},
      status: 'confirmed',
    };

    const newRegistration = await registration.create(registrationData);

    // TODO: Send confirmation email
    console.log(`Would send registration confirmation email to ${currentUser.email}`);
    console.log(`Confirmation code: ${newRegistration. confirmation_code}`);

    return response.status(201).json(newRegistration);
  } catch (error) {
    console. error('Error creating registration:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listRegistrations(request, response, conferenceId) {
  try {
    const { status, limit, offset } = request.query;

    // Check if user has permission to view registrations (organizer or admin)
    const currentUser = await authorization.getUserFromRequest(request);
    
    if (! currentUser) {
      return response.status(401).json({ error: 'Authentication required' });
    }

    const conferenceData = await conference.findOneById(conferenceId);
    if (!conferenceData) {
      return response.status(404). json({ error: 'Conference not found' });
    }

    // Only organizer can view all registrations
    if (conferenceData.organizer_id !== currentUser.id) {
      return response.status(403).json({ error: 'Only organizers can view all registrations' });
    }

    const options = {
      status,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };

    const registrations = await registration.findByConferenceId(conferenceId, options);
    const count = await registration.getRegistrationCount(conferenceId, status);

    return response.status(200).json({
      registrations,
      total: count,
    });
  } catch (error) {
    console.error('Error listing registrations:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}