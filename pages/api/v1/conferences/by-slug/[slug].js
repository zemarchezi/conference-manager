import conference from 'models/conference.js'; // Remove space before .js
import session from 'models/session.js';

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const { slug } = request.query;

    try {
        const conferenceData = await conference.findOneBySlug(slug);

        if (!conferenceData) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Allow public access to active/published conferences
        if (
            conferenceData.status === 'active' ||
            conferenceData.status === 'published'
        ) {
            return response.status(200).json(conferenceData);
        }

        // For draft conferences, check if user is the organizer
        const sessionToken = getSessionToken(request);
        if (!sessionToken) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        const sessionObj = await session.findOneValidByToken(sessionToken);
        if (!sessionObj) {
            return response.status(404).json({ error: 'Conference not found' });
        }

        // Allow access if user is the organizer
        if (sessionObj.user_id === conferenceData.organizer_id) {
            return response.status(200).json(conferenceData);
        }

        return response.status(404).json({ error: 'Conference not found' });
    } catch (error) {
        console.error('Error fetching conference:', error);
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
