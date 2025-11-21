import { beforeEach, describe, expect, test } from 'vitest';
import orchestrator from 'tests/orchestrator.js';

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe('POST /api/v1/conferences/create', () => {
  test('Authenticated user can create a conference', async () => {
    const user = await orchestrator.createUser({
      username: 'organizer',
      email: 'organizer@example.com',
    });

    await orchestrator.activateUser(user);
    const session = await orchestrator.createSession(user);

    const conferenceData = {
      title: 'AI Conference 2025',
      description: 'Annual AI conference',
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      location: 'San Francisco, CA',
      submission_deadline: '2025-04-01',
      settings: {
        primary_color: '#3b82f6',
        enable_reviews: true,
      },
    };

    const response = await fetch('http://localhost:3000/api/v1/conferences/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `session_id=${session.token}`,
      },
      body: JSON.stringify(conferenceData),
    });

    expect(response.status).toBe(201);
    const conference = await response.json();
    
    expect(conference.title).toBe(conferenceData.title);
    expect(conference.slug).toBeTruthy();
    expect(conference.organizer_id).toBe(user.id);
    expect(conference.status).toBe('draft');
  });

  test('User is automatically assigned organizer role on conference creation', async () => {
    const user = await orchestrator.createUser({
      username: 'neworganizer',
      email: 'neworg@example.com',
    });

    await orchestrator.activateUser(user);
    const session = await orchestrator.createSession(user);

    const response = await fetch('http://localhost:3000/api/v1/conferences/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `session_id=${session.token}`,
      },
      body: JSON.stringify({
        title: 'Test Conference',
        description: 'Test',
        start_date: '2025-06-01',
        end_date: '2025-06-03',
      }),
    });

    const conference = await response.json();

    // Check if user has organizer role
    const rolesResponse = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference.id}/members`,
      {
        headers: {
          cookie: `session_id=${session.token}`,
        },
      }
    );

    const members = await rolesResponse.json();
    const organizer = members.find((m) => m.user_id === user.id && m.role === 'organizer');
    
    expect(organizer).toBeTruthy();
    expect(organizer.permissions).toContain('create:conference');
  });

  test('Conference creation fails with invalid dates', async () => {
    const user = await orchestrator.createUser({
      username: 'testuser',
      email: 'test@example.com',
    });

    await orchestrator.activateUser(user);
    const session = await orchestrator.createSession(user);

    const response = await fetch('http://localhost:3000/api/v1/conferences/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `session_id=${session.token}`,
      },
      body: JSON.stringify({
        title: 'Invalid Conference',
        description: 'Test',
        start_date: '2025-06-03',
        end_date: '2025-06-01', // End before start
      }),
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toContain('End date must be after start date');
  });

  test('Unauthenticated user cannot create conference', async () => {
    const response = await fetch('http://localhost:3000/api/v1/conferences/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Conference',
        description: 'Test',
        start_date: '2025-06-01',
        end_date: '2025-06-03',
      }),
    });

    expect(response.status).toBe(401);
  });
});