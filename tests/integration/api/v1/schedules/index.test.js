import orchestrator from 'tests/orchestrator.js';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('POST /api/v1/schedules', () => {
  test('Creating a schedule item with valid data', async () => {
    // Setup authentication and conference...
    
    const scheduleResponse = await fetch('http://localhost:3000/api/v1/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        conference_id: conference.id,
        title: 'Opening Keynote',
        description: 'Welcome and opening remarks',
        start_time: '2025-06-01T09:00:00Z',
        end_time: '2025-06-01T10:00:00Z',
        location: 'Main Hall',
      }),
    });

    expect(scheduleResponse.status).toBe(201);
    const schedule = await scheduleResponse.json();
    expect(schedule.title).toBe('Opening Keynote');
  });

  test('Creating schedule with time conflict detection', async () => {
    // Test overlapping schedules...
  });
});

describe('GET /api/v1/schedules', () => {
  test('Listing schedules for a conference', async () => {
    const response = await fetch('http://localhost:3000/api/v1/schedules?conference_id=1');

    expect(response.status).toBe(200);
    const schedules = await response.json();
    expect(Array.isArray(schedules)).toBe(true);
  });

  test('Schedules are ordered by start_time', async () => {
    const response = await fetch('http://localhost:3000/api/v1/schedules?conference_id=1');
    const schedules = await response.json();

    for (let i = 1; i < schedules.length; i++) {
      expect(new Date(schedules[i].start_time) >= new Date(schedules[i - 1].start_time)).toBe(true);
    }
  });
});

describe('DELETE /api/v1/schedules/[id]', () => {
  test('Deleting a schedule item', async () => {
    const deleteResponse = await fetch(`http://localhost:3000/api/v1/schedules/${schedule.id}`, {
      method: 'DELETE',
      headers: {
        Cookie: sessionCookie,
      },
    });

    expect(deleteResponse.status).toBe(200);
  });
});