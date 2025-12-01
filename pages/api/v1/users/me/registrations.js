import registration from 'models/registration.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const currentUser = await authorization.getUserFromRequest(request);
    if (!currentUser) {
      return response.status(401). json({ error: 'Authentication required' });
    }

    const { status, limit, offset } = request.query;

    const options = {
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };

    const registrations = await registration.findByUserId(currentUser.id, options);

    return response.status(200). json(registrations);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}