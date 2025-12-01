import abstract from 'models/abstract.js';
import schedule from 'models/schedule.js';
import conference from 'models/conference.js';
import db from 'models/db.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { conference_id, section } = request.query;

  try {
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

    const conferenceId = conferenceData.id;

    // Fetch section data based on query parameter
    switch (section) {
      case 'submissions':
        const submissions = await abstract.findAll(conferenceId, { limit: 100 });
        return response.status(200).json({ submissions });

      case 'schedule':
        const scheduleData = await schedule. findByConferenceId(conferenceId);
        return response.status(200). json({ schedule: scheduleData || [] });

      case 'speakers':
        // Get accepted abstracts with author information
        const speakersQuery = {
          text: `
            SELECT DISTINCT u.id, u.username, u.email, a.title as presentation_title
            FROM users u
            INNER JOIN abstracts a ON a.author_id = u.id
            WHERE a.conference_id = $1 AND a.status = 'accepted'
            ORDER BY u.username
          `,
          values: [conferenceId],
        };
        const speakersResult = await db.query(speakersQuery);
        return response.status(200).json({ speakers: speakersResult.rows });

      default:
        return response.status(400).json({ error: 'Invalid section requested.  Use: submissions, schedule, or speakers' });
    }
  } catch (error) {
    console.error('Error fetching conference section:', error);
    return response. status(500).json({ error: 'Failed to fetch section data' });
  }
}