import conference from 'models/conference.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = request.query;

  try {
    const conferenceData = await conference.findOneBySlug(slug);

    if (!conferenceData) {
      return response.status(404).json({ error: 'Conference not found' });
    }

    // Only return public conferences or active ones
    if (conferenceData.status !== 'active' && conferenceData.status !== 'published') {
      // Check if user has permission to view draft conferences
      // For now, return 404 for non-published conferences
      return response.status(404).json({ error: 'Conference not found' });
    }

    return response.status(200).json(conferenceData);
  } catch (error) {
    console.error('Error fetching conference:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}