import userConferenceRole from 'models/user-conference-role.js';
import conference from 'models/conference.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { conference_id } = request.query;

    try {
        // Get session token
        const sessionToken = getSessionToken(request);
        if (!sessionToken) {
            return response.status(403).json({
                error: 'User must be authenticated to register for a conference',
            });
        }

        // Get current user from session
        const sessionObj = await session.findOneValidByToken(sessionToken);
        if (!sessionObj) {
            return response
                .status(403)
                .json({ error: 'Invalid or expired session' });
        }

        const currentUser = await user.findOneById(sessionObj.user_id);

        // Validate role
        const validRoles = ['attendee', 'speaker', 'reviewer'];
        const role = request.body.role || 'attendee';

        if (!validRoles.includes(role)) {
            return response.status(400).json({
                error: 'Invalid role.  Must be one of: attendee, speaker, reviewer',
            });
        }

        // Find conference - try by ID first, then by slug
        let conferenceData;
        if (isNaN(conference_id)) {
            conferenceData = await conference.findOneBySlug(conference_id);
        } else {
            conferenceData = await conference.findOneById(conference_id);
        }

        if (!conferenceData) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Check if user is already registered
        const existingRole = await userConferenceRole.findByUserAndConference(
            currentUser.id,
            conferenceData.id,
        );

        if (existingRole) {
            return response.status(400).json({
                error: 'User is already registered for this conference',
            });
        }

        // Register user for conference
        const registration = await userConferenceRole.create({
            user_id: currentUser.id,
            conference_id: conferenceData.id,
            role: role,
        });

        return response.status(201).json({
            message: 'Successfully registered for conference',
            registration,
        });
    } catch (error) {
        console.error('Error registering for conference:', error);
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
