// Tests for the status endpoint
const request = require('supertest');
const app = require('../../app');

describe('GET /api/v1/status', () => {
  it('should return 200 and status message', async () => {
    const res = await request(app).get('/api/v1/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
  });
});