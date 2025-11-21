import { beforeEach, describe, expect, test } from 'vitest';
import orchestrator from 'tests/orchestrator.js';

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe('Multi-Tenant Data Isolation - Abstracts', () => {
  test('User cannot access abstracts from another conference', async () => {
    // Setup two conferences
    const user1 = await orchestrator.createUser({
      username: 'user1',
      email: 'user1@example.com',
    });
    const user2 = await orchestrator.createUser({
      username: 'user2',
      email: 'user2@example.com',
    });

    await orchestrator.activateUser(user1);
    await orchestrator.activateUser(user2);

    const conference1 = await orchestrator.createConference({
      title: 'Conference A',
      organizer_id: user1.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conference B',
      organizer_id: user2.id,
      start_date: '2025-07-01',
      end_date: '2025-07-03',
    });

    // Assign author roles
    await orchestrator.assignConferenceRole({
      user_id: user1.id,
      conference_id: conference1.id,
      role: 'author',
    });

    await orchestrator.assignConferenceRole({
      user_id: user2.id,
      conference_id: conference2.id,
      role: 'author',
    });

    // Create abstracts
    const abstract1 = await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: user1.id,
      title: 'Abstract in Conference A',
      content: 'Content A',
    });

    const abstract2 = await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: user2.id,
      title: 'Abstract in Conference B',
      content: 'Content B',
    });

    const session1 = await orchestrator.createSession(user1);

    // User1 tries to access abstract from Conference B
    const response = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/abstracts/${abstract2.id}`,
      {
        headers: { cookie: `session_id=${session1.token}` },
      }
    );

    expect(response.status).toBe(403);
  });

  test('Listing abstracts only returns items from specified conference', async () => {
    const user = await orchestrator.createUser({
      username: 'multiauthor',
      email: 'multi@example.com',
    });
    await orchestrator.activateUser(user);

    const conference1 = await orchestrator.createConference({
      title: 'Conf 1',
      organizer_id: user.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conf 2',
      organizer_id: user.id,
      start_date: '2025-07-01',
      end_date: '2025-07-03',
    });

    await orchestrator.assignConferenceRole({
      user_id: user.id,
      conference_id: conference1.id,
      role: 'author',
    });

    await orchestrator.assignConferenceRole({
      user_id: user.id,
      conference_id: conference2.id,
      role: 'author',
    });

    // Create 3 abstracts in conference 1
    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: user.id,
      title: 'Abstract 1-1',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: user.id,
      title: 'Abstract 1-2',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: user.id,
      title: 'Abstract 1-3',
      content: 'Content',
    });

    // Create 2 abstracts in conference 2
    await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: user.id,
      title: 'Abstract 2-1',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: user.id,
      title: 'Abstract 2-2',
      content: 'Content',
    });

    const session = await orchestrator.createSession(user);

    // Query conference 1
    const response1 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference1.id}/abstracts`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const abstracts1 = await response1.json();
    expect(abstracts1.length).toBe(3);
    expect(abstracts1.every((a) => a.conference_id === conference1.id)).toBe(true);

    // Query conference 2
    const response2 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/abstracts`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const abstracts2 = await response2.json();
    expect(abstracts2.length).toBe(2);
    expect(abstracts2.every((a) => a.conference_id === conference2.id)).toBe(true);
  });

  test('Cannot update abstract from different conference', async () => {
    const user = await orchestrator.createUser({
      username: 'author',
      email: 'author@example.com',
    });
    await orchestrator.activateUser(user);

    const conference1 = await orchestrator.createConference({
      title: 'Conference 1',
      organizer_id: user.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conference 2',
      organizer_id: user.id,
      start_date: '2025-07-01',
      end_date: '2025-07-03',
    });

    await orchestrator.assignConferenceRole({
      user_id: user.id,
      conference_id: conference1.id,
      role: 'author',
    });

    const abstract1 = await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: user.id,
      title: 'Original Title',
      content: 'Original Content',
    });

    const session = await orchestrator.createSession(user);

    // Try to update abstract1 via conference2 endpoint
    const response = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/abstracts/${abstract1.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          cookie: `session_id=${session.token}`,
        },
        body: JSON.stringify({
          title: 'Hacked Title',
        }),
      }
    );

    expect(response.status).toBe(404); // Abstract not found in conference 2
  });
});

describe('Multi-Tenant Data Isolation - Reviews', () => {
  test('Reviews are scoped to conference context', async () => {
    const reviewer = await orchestrator.createUser({
      username: 'reviewer',
      email: 'reviewer@example.com',
    });
    await orchestrator.activateUser(reviewer);

    const conference1 = await orchestrator.createConference({
      title: 'Conf 1',
      organizer_id: reviewer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conf 2',
      organizer_id: reviewer.id,
      start_date: '2025-07-01',
      end_date: '2025-07-03',
    });

    await orchestrator.assignConferenceRole({
      user_id: reviewer.id,
      conference_id: conference1.id,
      role: 'reviewer',
    });

    await orchestrator.assignConferenceRole({
      user_id: reviewer.id,
      conference_id: conference2.id,
      role: 'reviewer',
    });

    const abstract1 = await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: reviewer.id,
      title: 'Abstract 1',
      content: 'Content',
    });

    const abstract2 = await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: reviewer.id,
      title: 'Abstract 2',
      content: 'Content',
    });

    // Create reviews
    await orchestrator.createReview({
      abstract_id: abstract1.id,
      reviewer_id: reviewer.id,
      score: 8,
      recommendation: 'accept',
    });

    await orchestrator.createReview({
      abstract_id: abstract2.id,
      reviewer_id: reviewer.id,
      score: 6,
      recommendation: 'revise',
    });

    const session = await orchestrator.createSession(reviewer);

    // Query reviews for conference 1
    const response1 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference1.id}/reviews`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const reviews1 = await response1.json();
    expect(reviews1.length).toBe(1);
    expect(reviews1[0].abstract_id).toBe(abstract1.id);

    // Query reviews for conference 2
    const response2 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/reviews`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const reviews2 = await response2.json();
    expect(reviews2.length).toBe(1);
    expect(reviews2[0].abstract_id).toBe(abstract2.id);
  });
});

describe('Multi-Tenant Data Isolation - Schedules', () => {
  test('Schedule items are properly isolated by conference', async () => {
    const organizer = await orchestrator.createUser({
      username: 'organizer',
      email: 'organizer@example.com',
    });
    await orchestrator.activateUser(organizer);

    const conference1 = await orchestrator.createConference({
      title: 'Conf 1',
      organizer_id: organizer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conf 2',
      organizer_id: organizer.id,
      start_date: '2025-07-01',
      end_date: '2025-07-03',
    });

    await orchestrator.createScheduleItem({
      conference_id: conference1.id,
      title: 'Keynote 1',
      start_time: '2025-06-01T09:00:00Z',
      end_time: '2025-06-01T10:00:00Z',
    });

    await orchestrator.createScheduleItem({
      conference_id: conference2.id,
      title: 'Keynote 2',
      start_time: '2025-07-01T09:00:00Z',
      end_time: '2025-07-01T10:00:00Z',
    });

    const session = await orchestrator.createSession(organizer);

    const response1 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference1.id}/schedules`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const schedule1 = await response1.json();
    expect(schedule1.length).toBe(1);
    expect(schedule1[0].title).toBe('Keynote 1');

    const response2 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/schedules`,
      {
        headers: { cookie: `session_id=${session.token}` },
      }
    );

    const schedule2 = await response2.json();
    expect(schedule2.length).toBe(1);
    expect(schedule2[0].title).toBe('Keynote 2');
  });
});