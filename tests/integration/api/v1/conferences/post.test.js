// Tests for conference creation and listing
const request = require('supertest');
const app = require('../../app');

describe('POST /api/v1/conferences', () => {
  it('should create a new conference', async () => {
    const res = await request(app)
      .post('/api/v1/conferences')
      .send({ name: 'Test Conference' });
    expect(res.statusCode).toEqual(201);
  });
});