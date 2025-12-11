import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('POST /api/v1/conferences/[conference_id]/speakers', () => {
    let testConference;
    let organizerCookie;
    let regularUserCookie;

    beforeAll(async () => {
        // Setup test conference and users
    });

    afterAll(async () => {
        // Cleanup
    });

    it('should create a new speaker as organizer', async () => {
        const speakerData = {
            name: 'Dr. Jane Smith',
            title: 'Professor of AI',
            organization: 'MIT',
            bio: 'Leading expert in artificial intelligence and machine learning.',
            photo_url: 'https://example. com/photo.jpg',
            website: 'https://janesmith.com',
            twitter: '@janesmith',
            linkedin: 'https://linkedin.com/in/janesmith',
            email: 'jane@mit.edu',
            is_keynote: true,
            display_order: 0,
        };

        const response = await fetch(
            `http://localhost:3000/api/v1/conferences/${testConference.id}/speakers`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: organizerCookie,
                },
                body: JSON.stringify(speakerData),
            },
        );

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe('Dr. Jane Smith');
        expect(data.is_keynote).toBe(true);
    });

    it('should return 403 if non-organizer tries to add speaker', async () => {
        const response = await fetch(
            `http://localhost:3000/api/v1/conferences/${testConference.id}/speakers`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: regularUserCookie,
                },
                body: JSON.stringify({
                    name: 'Test Speaker',
                }),
            },
        );

        expect(response.status).toBe(403);
    });

    it('should return 401 if user not authenticated', async () => {
        const response = await fetch(
            `http://localhost:3000/api/v1/conferences/${testConference.id}/speakers`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test Speaker',
                }),
            },
        );

        expect(response.status).toBe(401);
    });
});
