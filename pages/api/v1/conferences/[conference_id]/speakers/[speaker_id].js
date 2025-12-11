import speaker from 'models/speaker.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id, speaker_id } = request.query;

    // Verify conference exists
    const conf = await conference.findOneById(conference_id);
    if (!conf) {
        return response.status(404).json({ error: 'Conference not found' });
    }

    if (request.method === 'GET') {
        return await getSpeaker(request, response, conference_id, speaker_id);
    }

    if (request.method === 'PATCH') {
        return await updateSpeaker(
            request,
            response,
            conference_id,
            speaker_id,
        );
    }

    if (request.method === 'DELETE') {
        return await deleteSpeaker(
            request,
            response,
            conference_id,
            speaker_id,
        );
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function getSpeaker(request, response, conference_id, speaker_id) {
    try {
        const speakerData = await speaker.findById(speaker_id, conference_id);
        if (!speakerData) {
            return response.status(404).json({ error: 'Speaker not found' });
        }
        return response.status(200).json(speakerData);
    } catch (error) {
        console.error('Error fetching speaker:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function updateSpeaker(request, response, conference_id, speaker_id) {
    try {
        const canManage = await authorization.canRequest(
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = request.body;
        const updatedSpeaker = await speaker.update(
            speaker_id,
            conference_id,
            updateData,
        );

        if (!updatedSpeaker) {
            return response.status(404).json({ error: 'Speaker not found' });
        }

        return response.status(200).json(updatedSpeaker);
    } catch (error) {
        console.error('Error updating speaker:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteSpeaker(request, response, conference_id, speaker_id) {
    try {
        const canManage = await authorization.canRequest(
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const deletedSpeaker = await speaker.deleteById(
            speaker_id,
            conference_id,
        );

        if (!deletedSpeaker) {
            return response.status(404).json({ error: 'Speaker not found' });
        }

        return response
            .status(200)
            .json({ message: 'Speaker deleted successfully' });
    } catch (error) {
        console.error('Error deleting speaker:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
