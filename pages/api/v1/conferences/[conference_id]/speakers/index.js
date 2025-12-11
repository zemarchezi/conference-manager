import speaker from 'models/speaker.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id } = request.query;

    if (request.method === 'GET') {
        return await listSpeakers(request, response, conference_id);
    }

    if (request.method === 'POST') {
        return await createSpeaker(request, response, conference_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function listSpeakers(request, response, conferenceId) {
    try {
        const conferenceData = await conference.findOneById(conferenceId);
        if (!conferenceData) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        const speakers = await speaker.findByConferenceId(conferenceId);
        return response.status(200).json(speakers);
    } catch (error) {
        console.error('Error listing speakers:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function createSpeaker(request, response, conferenceId) {
    try {
        const currentUser = await authorization.getUserFromRequest(request);
        if (!currentUser) {
            return response
                .status(401)
                .json({ error: 'Authentication required' });
        }

        const conferenceData = await conference.findOneById(conferenceId);
        if (!conferenceData) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Only organizer can add speakers
        if (conferenceData.organizer_id !== currentUser.id) {
            return response
                .status(403)
                .json({ error: 'Only organizers can add speakers' });
        }

        const speakerData = {
            conference_id: conferenceId,
            name: request.body.name,
            title: request.body.title,
            organization: request.body.organization,
            bio: request.body.bio,
            photo_url: request.body.photo_url,
            website: request.body.website,
            twitter: request.body.twitter,
            linkedin: request.body.linkedin,
            email: request.body.email,
            is_keynote: request.body.is_keynote,
            display_order: request.body.display_order,
        };

        const newSpeaker = await speaker.create(speakerData);
        return response.status(201).json(newSpeaker);
    } catch (error) {
        console.error('Error creating speaker:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
