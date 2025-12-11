import registration from 'models/conference-registration.js';
import conference from 'models/conference.js';
import session from 'models/session.js';
import user from 'models/user.js';
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
            'manage:conference',
            request,
        );
        if (!canManage) {
            return response.status(403).json({ error: 'Unauthorized' });
        }

        const { status, limit, offset } = request.query;
        const registrations = await registration.findByConferenceId(
            conference_id,
            {
                status,
                limit: limit ? parseInt(limit) : undefined,
                offset: offset ? parseInt(offset) : undefined,
            },
        );

        return response.status(200).json(registrations);
    } catch (error) {
        console.error('Error listing registrations:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function createRegistration(request, response, conference_id) {
    try {
        // Get current user
        const sessionToken = getSessionToken(request);
        if (!sessionToken) {
            return response
                .status(401)
                .json({ error: 'Authentication required' });
        }

        const sessionObj = await session.findOneValidByToken(sessionToken);
        if (!sessionObj) {
            return response.status(401).json({ error: 'Invalid session' });
        }

        const currentUser = await user.findOneById(sessionObj.user_id);

        // Check if user already registered
        const existingReg = await registration.findByUserId(
            currentUser.id,
            conference_id,
        );
        if (existingReg) {
            return response.status(400).json({
                error: 'You are already registered for this conference',
            });
        }

        const registrationData = request.body.registration_data || request.body;
        const newRegistration = await registration.create(
            conference_id,
            currentUser.id,
            registrationData,
        );

        return response.status(201).json(newRegistration);
    } catch (error) {
        console.error('Error creating registration:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

function getSessionToken(request) {
    const cookies = parseCookies(request.headers.cookie || '');
    return cookies.session_id;
}

function parseCookies(cookieHeader) {
    const cookies = {};
    cookieHeader.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        cookies[parts[0].trim()] = parts[1];
    });
    return cookies;
}
