// Tests for user creation and retrieval endpoints
const request = require('supertest');
const app = require('../../app');

describe('POST /api/v1/users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ username: 'testuser', password: 'testpass' });
    expect(res.statusCode).toEqual(201);
  });
});