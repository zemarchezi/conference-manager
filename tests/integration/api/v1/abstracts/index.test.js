import orchestrator from 'tests/orchestrator.js';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('POST /api/v1/abstracts', () => {
  test('Creating an abstract without authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/abstracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conference_id: 1,
        title: 'Test Abstract',
        content: 'This is a test abstract content',
        keywords: ['test', 'abstract'],
      }),
    });

    expect(response.status).toBe(401);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('User must be authenticated to submit abstracts');
  });

  test('Creating an abstract with valid data', async () => {
    // Create user
    const userResponse = await fetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'author1',
        email: 'author1@example.com',
        password: 'password123',
      }),
    });
    expect(userResponse.status).toBe(201);
    const user = await userResponse.json();

    // Activate user
    await orchestrator.activateUser(user.id);

    // Login
    const loginResponse = await fetch('http://localhost:3000/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'author1@example.com',
        password: 'password123',
      }),
    });
    expect(loginResponse.status).toBe(201);
    const sessionCookie = loginResponse.headers.get('set-cookie');

    // Create conference
    const conferenceResponse = await fetch('http://localhost:3000/api/v1/conferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        title: 'AI Conference 2025',
        description: 'Annual AI Conference',
        start_date: '2025-06-01',
        end_date: '2025-06-03',
        location: 'San Francisco',
      }),
    });
    const conference = await conferenceResponse.json();

    // Create abstract
    const abstractResponse = await fetch('http://localhost:3000/api/v1/abstracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        conference_id: conference.id,
        title: 'Deep Learning for Climate Prediction',
        content: 'This paper explores the application of deep learning models for improving climate prediction accuracy.',
        keywords: ['deep learning', 'climate', 'prediction', 'neural networks'],
      }),
    });

    expect(abstractResponse.status).toBe(201);
    const abstract = await abstractResponse.json();
    expect(abstract.title).toBe('Deep Learning for Climate Prediction');
    expect(abstract.author_id).toBe(user.id);
    expect(abstract.conference_id).toBe(conference.id);
    expect(abstract.status).toBe('submitted');
  });

  test('Creating an abstract without title', async () => {
    const userResponse = await fetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'author2',
        email: 'author2@example.com',
        password: 'password123',
      }),
    });
    const user = await userResponse.json();
    await orchestrator.activateUser(user.id);

    const loginResponse = await fetch('http://localhost:3000/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'author2@example.com',
        password: 'password123',
      }),
    });
    const sessionCookie = loginResponse.headers.get('set-cookie');

    const abstractResponse = await fetch('http://localhost:3000/api/v1/abstracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        conference_id: 1,
        content: 'Content without title',
      }),
    });

    expect(abstractResponse.status).toBe(400);
    const responseBody = await abstractResponse.json();
    expect(responseBody.error).toBe('Validation Error');
  });
});

describe('GET /api/v1/abstracts', () => {
  test('Listing all abstracts', async () => {
    const response = await fetch('http://localhost:3000/api/v1/abstracts');

    expect(response.status).toBe(200);
    const abstracts = await response.json();
    expect(Array.isArray(abstracts)).toBe(true);
  });

  test('Filtering abstracts by conference_id', async () => {
    const response = await fetch('http://localhost:3000/api/v1/abstracts?conference_id=1');

    expect(response.status).toBe(200);
    const abstracts = await response.json();
    expect(Array.isArray(abstracts)).toBe(true);
  });

  test('Pagination with limit and offset', async () => {
    const response = await fetch('http://localhost:3000/api/v1/abstracts?limit=5&offset=0');

    expect(response.status).toBe(200);
    const abstracts = await response.json();
    expect(abstracts.length).toBeLessThanOrEqual(5);
  });
});

describe('PATCH /api/v1/abstracts/[id]', () => {
  test('Updating own abstract', async () => {
    // Setup user and abstract...
    const updateResponse = await fetch(`http://localhost:3000/api/v1/abstracts/${abstract.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        title: 'Updated Title',
      }),
    });

    expect(updateResponse.status).toBe(200);
  });

  test('Updating someone else\'s abstract should fail', async () => {
    // Test ownership validation...
    expect(updateResponse.status).toBe(403);
  });
});