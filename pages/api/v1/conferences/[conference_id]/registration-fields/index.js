import registrationField from 'models/conference-registration-field.js';
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
        return await getFields(request, response, conference_id);
    }

    if (request.method === 'POST') {
        return await createField(request, response, conference_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function getFields(request, response, conference_id) {
    try {
        const fields =
            await registrationField.findByConferenceId(conference_id);
        return response.status(200).json(fields);
    } catch (error) {
        console.error('Error fetching registration fields:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function createField(request, response, conference_id) {
    try {
        // Check if user is organizer
        const canManage = await authorization.canRequest(
            'manage: conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const fieldData = request.body;
        const field = await registrationField.create(conference_id, fieldData);

        return response.status(201).json(field);
    } catch (error) {
        console.error('Error creating registration field:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
