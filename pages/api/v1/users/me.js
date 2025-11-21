import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authorization.getUserFromRequest(request);

    if (!user) {
      return response.status(401).json({ error: 'Not authenticated' });
    }

    // Remove sensitive data
    delete user.password;

    return response.status(200).json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}