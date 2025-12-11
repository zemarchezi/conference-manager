import registration from 'models/registration.js';
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
        return await listRegistrations(request, response, conference_id);
    }

    if (request.method === 'POST') {
        return await createRegistration(request, response, conference_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function listRegistrations(request, response, conference_id) {
    try {
        // Only organizers can view all registrations
        const canManage = await authorization.canRequest(
            'manage: conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const registrations =
            await registration.findByConferenceId(conference_id);
        return response.status(200).json(registrations);
    } catch (error) {
        console.error('Error listing registrations:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function createRegistration(request, response, conference_id) {
    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response
                .status(401)
                .json({ error: 'Authentication required' });
        }

        // Check if user already registered
        const existingReg = await registration.findByUserAndConference(
            currentUser.id,
            conference_id,
        );

        if (existingReg) {
            return response.status(400).json({
                error: 'You are already registered for this conference',
            });
        }

        const registrationData = {
            conference_id,
            user_id: currentUser.id,
            registration_type: request.body.registration_type || 'regular',
        };

        const newRegistration = await registration.create(registrationData);

        // TODO: Send confirmation email here
        // await sendRegistrationConfirmationEmail(currentUser, newRegistration);

        return response.status(201).json(newRegistration);
    } catch (error) {
        console.error('Error creating registration:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
