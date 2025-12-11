import registrationField from 'models/conference-registration-field.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
    const { conference_id, field_id } = request.query;

    // Verify conference exists
    const conf = await conference.findOneById(conference_id);
    if (!conf) {
        return response.status(404).json({ error: 'Conference not found' });
    }

    if (request.method === 'PATCH') {
        return await updateField(request, response, conference_id, field_id);
    }

    if (request.method === 'DELETE') {
        return await deleteField(request, response, conference_id, field_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function updateField(request, response, conference_id, field_id) {
    try {
        const canManage = await authorization.canRequest(
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const updateData = request.body;
        const field = await registrationField.update(
            field_id,
            conference_id,
            updateData,
        );

        if (!field) {
            return response.status(404).json({ error: 'Field not found' });
        }

        return response.status(200).json(field);
    } catch (error) {
        console.error('Error updating registration field:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteField(request, response, conference_id, field_id) {
    try {
        const canManage = await authorization.canRequest(
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const field = await registrationField.deleteById(
            field_id,
            conference_id,
        );

        if (!field) {
            return response.status(404).json({ error: 'Field not found' });
        }

        return response
            .status(200)
            .json({ message: 'Field deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration field:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
