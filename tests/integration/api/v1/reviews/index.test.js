// tests/integration/api/v1/reviews/index.test.js

const request = require('supertest');
const app = require('../../../../app');
const { createUser, loginUser, createReview, getReview, updateReview, deleteReview } = require('../../../../helpers/testHelpers');

describe('Review API', () => {
    let authToken;
    let reviewId;

    beforeAll(async () => {
        const user = await createUser({ username: 'testuser', password: 'Password123!' });
        authToken = await loginUser(user);
    });

    it('should create a review (POST /api/v1/reviews)', async () => {
        const res = await request(app)
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Great Conference', description: 'Loved the sessions!', rating: 5 });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        reviewId = res.body.id;
    });

    it('should get a review (GET /api/v1/reviews/:id)', async () => {
        const res = await request(app)
            .get(`/api/v1/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Great Conference');
    });

    it('should update a review (PATCH /api/v1/reviews/:id)', async () => {
        const res = await request(app)
            .patch(`/api/v1/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Updated Review Title' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Review Title');
    });

    it('should delete a review (DELETE /api/v1/reviews/:id)', async () => {
        const res = await request(app)
            .delete(`/api/v1/reviews/${reviewId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(204);
    });

    it('should return 401 for unauthorized access', async () => {
        const res = await request(app)
            .post('/api/v1/reviews')
            .send({ title: 'Unauthorized Review', description: 'This should not work.', rating: 3 });

        expect(res.statusCode).toBe(401);
    });

    it('should validate input for creating a review', async () => {
        const res = await request(app)
            .post('/api/v1/reviews')
            .set('Authorization', `Bearer ${authToken}`)
            .send({}); // sending empty object to trigger validation error

        expect(res.statusCode).toBe(400);
    });
});