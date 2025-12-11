import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createTestUser,
    createTestConference,
    cleanupTestData,
} from '../../../helpers/test-setup.js';
import database from '../../../../infra/database.js';

describe('GET /api/v1/conferences/[conference_id]/speakers', () => {
    let testConference;
    let testUser;

    beforeAll(async () => {
        testUser = await createTestUser();
        testConference = await createTestConference(testUser.id);

        // Add a keynote speaker
        await database.query({
            text: `
        INSERT INTO speakers (conference_id, name, is_keynote, display_order)
        VALUES ($1, $2, true, 0)
      `,
            values: [testConference.id, 'Keynote Speaker'],
        });

        // Add a regular speaker
        await database.query({
            text: `
        INSERT INTO speakers (conference_id, name, is_keynote, display_order)
        VALUES ($1, $2, false, 1)
      `,
            values: [testConference.id, 'Regular Speaker'],
        });
    });

    afterAll(async () => {
        await cleanupTestData(testUser.id, testConference.id);
    });

    it('should return all speakers for a conference', async () => {
        const response = await fetch(
            `http://localhost:3000/api/v1/conferences/${testConference.id}/speakers`,
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return speakers ordered by keynote status and display order', async () => {
        const response = await fetch(
            `http://localhost:3000/api/v1/conferences/${testConference.id}/speakers`,
        );
        const data = await response.json();

        // Keynote speakers should come first
        expect(data[0].is_keynote).toBe(true);
    });
});
