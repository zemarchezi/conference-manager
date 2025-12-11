import speaker from 'models/speaker.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id } = request.query;

    // Verify conference exists
    const conf = await conference.findOneById(conference_id);
    if (!conf) {
        return response.status(404).json({ error: 'Conference not found' });
    }

    if (request.method === 'GET') {
        return await getSpeakers(request, response, conference_id);
    }

    if (request.method === 'POST') {
        return await createSpeaker(request, response, conference_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function getSpeakers(request, response, conference_id) {
    try {
        const speakers = await speaker.findByConferenceId(conference_id);
        return response.status(200).json(speakers);
    } catch (error) {
        console.error('Error fetching speakers:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function createSpeaker(request, response, conference_id) {
    try {
        // Check if user is organizer
        const canManage = await authorization.canRequest(
            'manage: conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const speakerData = request.body;
        const newSpeaker = await speaker.create(conference_id, speakerData);

        return response.status(201).json(newSpeaker);
    } catch (error) {
        console.error('Error creating speaker:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
