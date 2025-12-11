import registration from 'models/conference-registration.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id } = request.query;

    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify conference exists
        const conf = await conference.findOneById(conference_id);
        if (!conf) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Only organizers can view stats
        const canManage = await authorization.canRequest(
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const stats = await registration.getStats(conference_id);
        return response.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching registration stats:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
