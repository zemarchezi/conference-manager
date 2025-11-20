import controller from 'models/review.js';
import authentication from 'models/authentication.js';
import authorization from 'models/authorization.js';
import validator from 'models/validator.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createReview(request, response);
  }

  if (request.method === 'GET') {
    return await listReviews(request, response);
  }

  return response.status(405).json({
    error: 'Method not allowed',
  });
}

async function createReview(request, response) {
  try {
    // Check authorization
    const canCreate = await authorization.canRequest('create:review', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to create reviews');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    // Validate review data
    validator.validateReviewSubmission(request.body);

    // Create review
    const reviewData = {
      abstract_id: request.body.abstract_id,
      reviewer_id: currentUser.id,
      score: request.body.score,
      comments: request.body.comments || '',
      recommendation: request.body.recommendation,
    };

    const newReview = await controller.create(reviewData);

    return response.status(201).json(newReview);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    if (error.name === 'UnauthorizedError') {
      return response.status(401).json({
        error: error.message,
      });
    }

    console.error('Error creating review:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function listReviews(request, response) {
  try {
    const { abstract_id, reviewer_id, limit, offset } = request.query;

    const options = {
      abstract_id: abstract_id,
      reviewer_id: reviewer_id,
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    };

    const reviews = await controller.findAll(options);

    return response.status(200).json(reviews);
  } catch (error) {
    console.error('Error listing reviews:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

function getSessionToken(request) {
  const cookies = parseCookies(request.headers.cookie || '');
  return cookies.session_id;
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    cookies[parts[0].trim()] = parts[1];
  });
  return cookies;
}