import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestUser, createTestConference, createAuthSession, cleanupTestData } from '../../../helpers/test-setup.js';

describe('POST /api/v1/conferences/[conference_id]/registrations', () => {
  let testConference;
  let testUser;
  let authCookie;

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser();
    
    // Create test conference
    testConference = await createTestConference(testUser.id);
    
    // Create auth session
    authCookie = await createAuthSession(testUser.id);
  });

  afterAll(async () => {
    await cleanupTestData(testUser. id, testConference.id);
  });

  it('should create a new registration for authenticated user', async () => {
    const response = await fetch(`http://localhost:3000/api/v1/conferences/${testConference.id}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie,
      },
      body: JSON.stringify({
        registration_type: 'regular',
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data). toHaveProperty('id');
    expect(data).toHaveProperty('confirmation_code');
    expect(data. status).toBe('confirmed');
    expect(data.conference_id).toBe(testConference.id);
  });

  it('should return 401 if user not authenticated', async () => {
    const response = await fetch(`http://localhost:3000/api/v1/conferences/${testConference.id}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_type: 'regular',
      }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});