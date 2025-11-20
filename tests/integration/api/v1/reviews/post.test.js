// Tests for review submission
const request = require('supertest');
const app = require('../../app');

describe('POST /api/v1/reviews', () => {
  it('should submit a review', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({ abstractId: 1, comment: 'Great work!' });
    expect(res.statusCode).toEqual(201);
  });
});