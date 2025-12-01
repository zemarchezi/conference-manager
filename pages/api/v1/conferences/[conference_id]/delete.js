import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id } = request. query;

  if (request.method !== 'DELETE') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current user using the authorization helper
    const currentUser = await authorization.getUserFromRequest(request);
    
    if (!currentUser) {
      return response.status(401).json({ error: 'User must be authenticated to delete conferences' });
    }

    // Get conference
    const conferenceData = await conference.findOneById(conference_id);
    if (!conferenceData) {
      return response.status(404). json({ error: 'Conference not found' });
    }

    // Check if user is the organizer (this is the real authorization check)
    if (conferenceData.organizer_id !== currentUser.id) {
      return response.status(403).json({ error: 'Only the conference organizer can delete this conference' });
    }

    // Delete the conference
    await conference.deleteConference(conference_id);

    return response.status(200).json({ message: 'Conference deleted successfully' });
  } catch (error) {
    console.error('Error deleting conference:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}