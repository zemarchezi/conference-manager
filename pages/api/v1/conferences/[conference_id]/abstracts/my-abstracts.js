import abstract from 'models/abstract.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id } = request.query;

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch abstracts by current user for this conference
        const abstracts = await abstract.findAll(conference_id, {
            author_id: currentUser.id,
        });

        return response.status(200).json(abstracts);
    } catch (error) {
        console.error('Error fetching my abstracts:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
