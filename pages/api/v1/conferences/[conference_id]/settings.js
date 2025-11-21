import conferenceSettings from 'models/conference-settings.js';
import conference from 'models/conference.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  if (request.method === 'GET') {
    return await getSettings(request, response, conference_id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function getSettings(request, response, conference_id) {
  try {
    // Verify conference exists
    const conf = await conference.findOneById(conference_id);
    if (!conf) {
      return response.status(404).json({ error: 'Conference not found' });
    }

    let settings = await conferenceSettings.findByConferenceId(conference_id);

    // If no settings exist, create default ones
    if (!settings) {
      settings = await conferenceSettings.create(conference_id);
    }

    return response.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching conference settings:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}