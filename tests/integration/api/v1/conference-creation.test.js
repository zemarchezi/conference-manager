import { beforeEach, describe, expect, test } from 'vitest';
import orchestrator from 'tests/orchestrator.js';

beforeEach(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.dropAllTables();
  await orchestrator.runPendingMigrations();
});

describe('Public Conference Pages', () => {
  test('Can access conference home page by slug', async () => {
    const organizer = await orchestrator.createUser({
      username: 'organizer',
      email: 'org@example.com',
    });

    const conference = await orchestrator.createConference({
      title: 'Public Conference 2025',
      organizer_id: organizer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      status: 'active',
    });

    const response = await fetch(`http://localhost:3000/api/v1/conferences/by-slug/${conference.slug}`);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Public Conference 2025');
    expect(data.slug).toBe(conference.slug);
  });

  test('Cannot access draft conference via public endpoint', async () => {
    const organizer = await orchestrator.createUser({
      username: 'organizer',
      email: 'org@example.com',
    });

    const conference = await orchestrator.createConference({
      title: 'Draft Conference',
      organizer_id: organizer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      status: 'draft',
    });

    const response = await fetch(`http://localhost:3000/api/v1/conferences/by-slug/${conference.slug}`);

    expect(response.status).toBe(404);
  });

  test('Public can view accepted abstracts', async () => {
    const organizer = await orchestrator.createUser({
      username: 'organizer',
      email: 'org@example.com',
    });

    const conference = await orchestrator.createConference({
      title: 'Test Conference',
      organizer_id: organizer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      status: 'active',
    });

    await orchestrator.createAbstract({
      conference_id: conference.id,
      author_id: organizer.id,
      title: 'Accepted Abstract',
      content: 'Content',
      status: 'accepted',
    });

    await orchestrator.createAbstract({
      conference_id: conference.id,
      author_id: organizer.id,
      title: 'Pending Abstract',
      content: 'Content',
      status: 'pending',
    });

    const response = await fetch(
      `http://localhost:3000/api/v1/conferences/${conference.id}/abstracts?status=accepted`
    );

    const abstracts = await response.json();
    expect(abstracts.length).toBe(1);
    expect(abstracts[0].title).toBe('Accepted Abstract');
  });

  test('Conference settings are properly returned', async () => {
    const organizer = await orchestrator.createUser({
      username: 'organizer',
      email: 'org@example.com',
    });

    const conference = await orchestrator.createConference({
      title: 'Styled Conference',
      organizer_id: organizer.id,
      start_date: '2025-06-01',
      end_date: '2025-06-03',
      status: 'active',
    });

    const response = await fetch(`http://localhost:3000/api/v1/conferences/${conference.id}/settings`);

    expect(response.status).toBe(200);
    const settings = await response.json();
    expect(settings.primary_color).toBeTruthy();
    expect(settings.enable_abstract_submission).toBe(true);
  });
});