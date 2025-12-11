import abstract from 'models/abstract.js';
import authorization from 'models/authorization.js';
import userConferenceRole from 'models/user-conference-role.js';

export default async function handler(request, response) {
    const { conference_id, id } = request.query;

    if (request.method === 'GET') {
        return await getAbstract(request, response, conference_id, id);
    }

    if (request.method === 'DELETE') {
        return await deleteAbstract(request, response, conference_id, id);
    }

    return response.status(405).json({ error: 'Method not allowed' });
}

async function getAbstract(request, response, conferenceId, abstractId) {
    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch the abstract
        const abstractData = await abstract.findOneById(
            abstractId,
            conferenceId,
        );

        if (!abstractData) {
            return response.status(404).json({ error: 'Abstract not found' });
        }

        // Check if user is author
        const isAuthor = abstractData.author_id === currentUser.id;

        // Check if user is organizer
        const roles = await userConferenceRole.getUserRolesInConference(
            currentUser.id,
            conferenceId,
        );
        const isOrganizer = roles.some((r) => r.role === 'organizer');

        // Only author or organizer can view
        if (!isAuthor && !isOrganizer) {
            return response.status(403).json({
                error: 'You do not have permission to view this abstract',
            });
        }

        return response.status(200).json({
            ...abstractData,
            is_author: isAuthor,
            is_organizer: isOrganizer,
        });
    } catch (error) {
        console.error('Error fetching abstract:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}

async function deleteAbstract(request, response, conferenceId, abstractId) {
    try {
        const currentUser = await authorization.getUserFromRequest(request);

        if (!currentUser) {
            return response.status(401).json({ error: 'Not authenticated' });
        }

        // Fetch the abstract
        const abstractData = await abstract.findOneById(
            abstractId,
            conferenceId,
        );

        if (!abstractData) {
            return response.status(404).json({ error: 'Abstract not found' });
        }

        // Only author can delete their own abstract
        if (abstractData.author_id !== currentUser.id) {
            return response.status(403).json({
                error: 'You can only delete your own abstracts',
            });
        }

        // Only allow deletion if status is 'submitted' or 'revision'
        if (!['submitted', 'revision'].includes(abstractData.status)) {
            return response.status(400).json({
                error: 'Cannot delete abstracts that have been accepted or rejected',
            });
        }

        await abstract.deleteById(abstractId, conferenceId);

        return response
            .status(200)
            .json({ message: 'Abstract deleted successfully' });
    } catch (error) {
        console.error('Error deleting abstract:', error);
        return response.status(500).json({ error: 'Internal server error' });
    }
}
