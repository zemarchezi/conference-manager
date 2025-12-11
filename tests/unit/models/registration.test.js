import { describe, it, expect, beforeEach, vi } from 'vitest';
import registration from '../../../models/registration.js'; // Remove the extra space after "registration"
import database from '../../../infra/database.js';

vi.mock('../../../infra/database.js');

describe('Registration Model', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('should create registration with confirmation code', async () => {
            const mockRegistration = {
                id: 'reg-123',
                conference_id: 'conf-123',
                user_id: 'user-123',
                status: 'confirmed',
                confirmation_code: 'ABC123DEF456',
            };

            database.query.mockResolvedValue({ rows: [mockRegistration] });

            const result = await registration.create({
                conference_id: 'conf-123',
                user_id: 'user-123',
                registration_type: 'regular',
            });

            expect(result).toEqual(mockRegistration);
            expect(result.confirmation_code).toBeDefined();
            expect(result.confirmation_code.length).toBeGreaterThan(0);
        });
    });

    describe('findByUserAndConference', () => {
        it('should find existing registration', async () => {
            const mockReg = { id: 'reg-123', status: 'confirmed' };
            database.query.mockResolvedValue({ rows: [mockReg] });

            const result = await registration.findByUserAndConference(
                'user-123',
                'conf-123',
            );

            expect(result).toEqual(mockReg);
        });

        it('should return undefined if not found', async () => {
            database.query.mockResolvedValue({ rows: [] });

            const result = await registration.findByUserAndConference(
                'user-123',
                'conf-123',
            );

            expect(result).toBeUndefined();
        });
    });

    describe('cancelRegistration', () => {
        it('should update status to cancelled', async () => {
            const mockCancelled = { id: 'reg-123', status: 'cancelled' };
            database.query.mockResolvedValue({ rows: [mockCancelled] });

            const result = await registration.cancelRegistration('reg-123');

            expect(result.status).toBe('cancelled');
        });
    });

    describe('getRegistrationCount', () => {
        it('should return total count', async () => {
            database.query.mockResolvedValue({ rows: [{ count: '42' }] });

            const count = await registration.getRegistrationCount('conf-123');

            expect(count).toBe(42);
        });
    });
});
