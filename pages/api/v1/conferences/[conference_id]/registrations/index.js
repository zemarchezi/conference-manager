import registration from 'models/registration.js';
import conference from 'models/conference.js';
import authorization from 'models/authorization.js';
import userConferenceRole from 'models/user-conference-role.js';

export default async function handler(request, response) {
    const { conference_id } = request.query;

    if (request.method === 'GET') {
        return await listRegistrations(request, response, conference_id);
    }

    if (request.method === 'POST') {
        return await createRegistration(request, response, conference_id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function createRegistration(request, response, conferenceId) {
    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response.status(401).json({
                error: 'User must be authenticated to register',
            });
        }

        const conferenceData = await conference.findOneById(conferenceId);
        if (!conferenceData) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Check if user already has a registration
        const existingRegistration = await registration.findByUserAndConference(
            currentUser.id,
            conferenceId,
        );

        // If registration exists and is NOT cancelled, reject
        if (
            existingRegistration &&
            existingRegistration.status !== 'cancelled'
        ) {
            return response.status(400).json({
                error: 'You are already registered for this conference',
                registration: existingRegistration,
            });
        }

        // If registration is cancelled, update it instead of creating new one
        if (
            existingRegistration &&
            existingRegistration.status === 'cancelled'
        ) {
            const updatedRegistration = await registration.update(
                existingRegistration.id,
                {
                    status: 'confirmed',
                    registration_type:
                        request.body.registration_type || 'regular',
                },
            );

            // Also assign attendee role if not already assigned
            await userConferenceRole.assignRole({
                user_id: currentUser.id,
                conference_id: conferenceId,
                role: 'attendee',
            });

            return response.status(200).json(updatedRegistration);
        }

        // Create new registration if none exists
        const registrationData = {
            conference_id: conferenceId,
            user_id: currentUser.id,
            registration_type: request.body.registration_type || 'regular',
            status: 'confirmed',
        };

        const newRegistration = await registration.create(registrationData);

        // Automatically assign attendee role
        await userConferenceRole.assignRole({
            user_id: currentUser.id,
            conference_id: conferenceId,
            role: 'attendee',
        });

        return response.status(201).json(newRegistration);
    } catch (error) {
        console.error('Error creating registration:', error);
        return response.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
}

async function listRegistrations(request, response, conferenceId) {
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

        // Check if user is organizer
        const context = await authorization.getUserConferenceContext(
            request,
            conferenceId,
        );

        if (!context || !context.permissions.includes('read:conference')) {
            return response.status(403).json({
                error: 'You do not have permission to view registrations',
            });
        }

        const registrations =
            await registration.findByConferenceId(conferenceId);
        return response.status(200).json(registrations);
    } catch (error) {
        console.error('Error listing registrations:', error);
        return response.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
}
