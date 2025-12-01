import abstract from 'models/abstract.js';
import authorization from 'models/authorization.js';
import userConferenceRole from 'models/user-conference-role.js';

export default async function handler(request, response) {
    const { conference_id, id } = request.query;

    if (request.method !== 'PATCH') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // Check if user is organizer
        const roles = await userConferenceRole.getUserRolesInConference(
            currentUser.id,
            conference_id,
        );
        const isOrganizer = roles.some((r) => r.role === 'organizer');

        if (!isOrganizer) {
            return response.status(403).json({
                error: 'Only organizers can update abstract status',
            });
        }

        const { status } = request.body;

        const validStatuses = ['submitted', 'accepted', 'rejected', 'revision'];
        if (!status || !validStatuses.includes(status)) {
            return response.status(400).json({
                error: `Invalid status.  Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const updatedAbstract = await abstract.updateStatus(
            id,
            conference_id,
            status,
        );

        if (!updatedAbstract) {
            return response.status(404).json({ error: 'Abstract not found' });
        }

        // TODO: Send email notification to author

        return response.status(200).json(updatedAbstract);
    } catch (error) {
        console.error('Error updating abstract status:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
