import review from 'models/review.js';
import abstract from 'models/abstract.js';
import conference from 'models/conference.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';

export default async function handler(request, response) {
  const { conference_id } = request.query;

  const conf = await conference.findOneById(conference_id);
  if (!conf) {
    return response.status(404).json({ error: 'Conference not found' });
  }

  if (request.method === 'POST') {
    return await createReview(request, response, conference_id);
  }

  if (request.method === 'GET') {
    return await listReviews(request, response, conference_id);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createReview(request, response, conference_id) {
  try {
    const canCreate = await authorization.canRequestInConference(
      'create:review',
      conference_id,
      request
    );

    if (!canCreate) {
      return response.status(403).json({
        error: 'You do not have permission to create reviews in this conference',
      });
    }

    const currentUser = await authorization.getUserFromRequest(request);

    // Validate review data
    if (!request.body.abstract_id || !request.body.score || !request.body.recommendation) {
      throw new validator.ValidationError([
        { field: 'abstract_id', message: 'Abstract ID is required' },
        { field: 'score', message: 'Score is required' },
        { field: 'recommendation', message: 'Recommendation is required' },
      ]);
    }

    // Verify abstract belongs to this conference
    const abstractData = await abstract.findOneById(request.body.abstract_id, conference_id);
    if (!abstractData) {
      return response.status(404).json({
        error: 'Abstract not found in this conference',
      });
    }

    const reviewData = {
      abstract_id: request.body.abstract_id,
      reviewer_id: currentUser.id,
      score: request.body.score,
      comments: request.body.comments || '',
      recommendation: request.body.recommendation,
    };

    const newReview = await review.create(reviewData);

    return response.status(201).json(newReview);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    console.error('Error creating review:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listReviews(request, response, conference_id) {
  try {
    const canRead = await authorization.canRequestInConference(
      'read:reviews',
      conference_id,
      request
    );

    if (!canRead) {
      return response.status(403).json({
        error: 'You do not have permission to view reviews for this conference',
      });
    }

    const { abstract_id, reviewer_id, limit, offset } = request.query;

    const options = {
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    if (abstract_id) {
      options.abstract_id = abstract_id;
    }

    if (reviewer_id) {
      options.reviewer_id = reviewer_id;
    }

    const reviews = await review.findAll(conference_id, options);

    return response.status(200).json(reviews);
  } catch (error) {
    console.error('Error listing reviews:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}