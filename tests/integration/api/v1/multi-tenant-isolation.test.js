import { beforeEach, describe, expect, test } from 'vitest';
import orchestrator from 'tests/orchestrator.js';

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe('Multi-Tenant Data Isolation', () => {
  test('Users in Conference A cannot access abstracts from Conference B', async () => {
    // Create two organizations
    const org1 = await orchestrator.createOrganization({
      name: 'University A',
    });
    const org2 = await orchestrator.createOrganization({
      name: 'University B',
    });

    // Create two conferences
    const conferenceA = await orchestrator.createConference({
      title: 'Conference A',
      organization_id: org1.id,
      organizer_id: org1.owner_id,
    });

    const conferenceB = await orchestrator.createConference({
      title: 'Conference B',
      organization_id: org2.id,
      organizer_id: org2.owner_id,
    });

    // Create users and assign to conferences
    const userA = await orchestrator.createUser({
      username: 'author_a',
      email: 'author_a@example.com',
    });

    const userB = await orchestrator.createUser({
      username: 'author_b',
      email: 'author_b@example.com',
    });

    // Assign roles
    await orchestrator.assignConferenceRole({
      user_id: userA.id,
      conference_id: conferenceA.id,
      role: 'author',
    });

    await orchestrator.assignConferenceRole({
      user_id: userB.id,
      conference_id: conferenceB.id,
      role: 'author',
    });

    // Create abstracts in each conference
    const abstractA = await orchestrator.createAbstract({
      conference_id: conferenceA.id,
      author_id: userA.id,
      title: 'Abstract from Conference A',
      content: 'This is a test abstract',
    });

    const abstractB = await orchestrator.createAbstract({
      conference_id: conferenceB.id,
      author_id: userB.id,
      title: 'Abstract from Conference B',
      content: 'This is a test abstract',
    });

    // Verify User A cannot access Abstract B
    const sessionA = await orchestrator.createSession(userA);
    const responseA = await fetch(
      `http://localhost:3000/api/v1/conferences/${conferenceB.id}/abstracts/${abstractB.id}`,
      {
        headers: {
          cookie: `session_id=${sessionA.token}`,
        },
      }
    );

    expect(responseA.status).toBe(403); // Forbidden

    // Verify User B cannot access Abstract A
    const sessionB = await orchestrator.createSession(userB);
    const responseB = await fetch(
      `http://localhost:3000/api/v1/conferences/${conferenceA.id}/abstracts/${abstractA.id}`,
      {
        headers: {
          cookie: `session_id=${sessionB.token}`,
        },
      }
    );

    expect(responseB.status).toBe(403); // Forbidden
  });

  test('Queries are automatically scoped to conference context', async () => {
    const org = await orchestrator.createOrganization({
      name: 'Test University',
    });

    const conference1 = await orchestrator.createConference({
      title: 'Conference 2024',
      organization_id: org.id,
      organizer_id: org.owner_id,
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conference 2025',
      organization_id: org.id,
      organizer_id: org.owner_id,
    });

    const author = await orchestrator.createUser({
      username: 'multi_author',
      email: 'multi@example.com',
    });

    // Assign author to both conferences
    await orchestrator.assignConferenceRole({
      user_id: author.id,
      conference_id: conference1.id,
      role: 'author',
    });

    await orchestrator.assignConferenceRole({
      user_id: author.id,
      conference_id: conference2.id,
      role: 'author',
    });

    // Create 3 abstracts in conference 1
    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: author.id,
      title: 'Abstract 1-1',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: author.id,
      title: 'Abstract 1-2',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference1.id,
      author_id: author.id,
      title: 'Abstract 1-3',
      content: 'Content',
    });

    // Create 2 abstracts in conference 2
    await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: author.id,
      title: 'Abstract 2-1',
      content: 'Content',
    });

    await orchestrator.createAbstract({
      conference_id: conference2.id,
      author_id: author.id,
      title: 'Abstract 2-2',
      content: 'Content',
    });

    // Query abstracts for conference 1
    const session = await orchestrator.createSession(author);
    const response1 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference1.id}/abstracts`,
      {
        headers: {
          cookie: `session_id=${session.token}`,
        },
      }
    );

    const abstracts1 = await response1.json();
    expect(abstracts1.length).toBe(3);
    expect(abstracts1.every((a) => a.conference_id === conference1.id)).toBe(true);

    // Query abstracts for conference 2
    const response2 = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}/abstracts`,
      {
        headers: {
          cookie: `session_id=${session.token}`,
        },
      }
    );

    const abstracts2 = await response2.json();
    expect(abstracts2.length).toBe(2);
    expect(abstracts2.every((a) => a.conference_id === conference2.id)).toBe(true);
  });

  test('Conference organizers can only manage their own conferences', async () => {
    const organizer1 = await orchestrator.createUser({
      username: 'organizer1',
      email: 'org1@example.com',
    });

    const organizer2 = await orchestrator.createUser({
      username: 'organizer2',
      email: 'org2@example.com',
    });

    const conference1 = await orchestrator.createConference({
      title: 'Conf 1',
      organizer_id: organizer1.id,
    });

    const conference2 = await orchestrator.createConference({
      title: 'Conf 2',
      organizer_id: organizer2.id,
    });

    const session1 = await orchestrator.createSession(organizer1);

    // Organizer 1 tries to update Conference 2
    const response = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference2.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          cookie: `session_id=${session1.token}`,
        },
        body: JSON.stringify({
          title: 'Hacked Conference',
        }),
      }
    );

    expect(response.status).toBe(403); // Forbidden
  });
});