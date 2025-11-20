// Tests for abstract submission and listing
const request = require('supertest');
const app = require('../../app');

describe('POST /api/v1/abstracts', () => {
  it('should submit a new abstract', async () => {
    const res = await request(app)
      .post('/api/v1/abstracts')
      .send({ title: 'Test Abstract', conferenceId: 1 });
    expect(res.statusCode).toEqual(201);
  });
});