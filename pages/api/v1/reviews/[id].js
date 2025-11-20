import controller from 'models/review.js';
import authorization from 'models/authorization.js';
import validator from 'models/validator.js';
import session from 'models/session.js';
import user from 'models/user.js';

export default async function handler(request, response) {
  const { id } = request.query;

  if (request.method === 'GET') {
    return await getReview(request, response, id);
  }

  if (request.method === 'PATCH') {
    return await updateReview(request, response, id);
  }

  if (request.method === 'DELETE') {
    return await deleteReview(request, response, id);
  }

  return response.status(405).json({
    error: 'Method not allowed',
  });
}

async function getReview(request, response, reviewId) {
  try {
    const review = await controller.findOneById(reviewId);

    if (!review) {
      throw new validator.NotFoundError('Review not found');
    }

    return response.status(200).json(review);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error getting review:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function updateReview(request, response, reviewId) {
  try {
    const canUpdate = await authorization.canRequest('update:review', request);
    if (!canUpdate) {
      throw new validator.UnauthorizedError('User must be authenticated to update reviews');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    const existingReview = await controller.findOneById(reviewId);
    if (!existingReview) {
      throw new validator.NotFoundError('Review not found');
    }

    if (existingReview.reviewer_id !== currentUser.id) {
      throw new validator.ForbiddenError('You can only update your own reviews');
    }

    const updateData = {};
    if (request.body.score !== undefined) {
      if (request.body.score < 1 || request.body.score > 10) {
        throw new validator.ValidationError([{ 
          field: 'score',
          message: 'Score must be between 1 and 10',
        }]);
      }
      updateData.score = request.body.score;
    }

    if (request.body.comments !== undefined) {
      updateData.comments = request.body.comments;
    }

    if (request.body.recommendation !== undefined) {
      if (!['accept', 'reject', 'revise'].includes(request.body.recommendation)) {
        throw new validator.ValidationError([{ 
          field: 'recommendation',
          message: 'Recommendation must be one of: accept, reject, revise',
        }]);
      }
      updateData.recommendation = request.body.recommendation;
    }

    const updatedReview = await controller.update(reviewId, updateData);

    return response.status(200).json(updatedReview);
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

    if (error.name === 'ForbiddenError') {
      return response.status(403).json({
        error: error.message,
      });
    }

    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error updating review:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function deleteReview(request, response, reviewId) {
  try {
    const canDelete = await authorization.canRequest('delete:review', request);
    if (!canDelete) {
      throw new validator.UnauthorizedError('User must be authenticated to delete reviews');
    }

    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findOneById(sessionObj.user_id);

    const existingReview = await controller.findOneById(reviewId);
    if (!existingReview) {
      throw new validator.NotFoundError('Review not found');
    }

    if (existingReview.reviewer_id !== currentUser.id && !currentUser.features.includes('admin')) {
      throw new validator.ForbiddenError('You can only delete your own reviews');
    }

    await controller.deleteById(reviewId);

    return response.status(200).json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    if (error.name === 'UnauthorizedError') {
      return response.status(401).json({
        error: error.message,
      });
    }

    if (error.name === 'ForbiddenError') {
      return response.status(403).json({
        error: error.message,
      });
    }

    if (error.name === 'NotFoundError') {
      return response.status(404).json({
        error: error.message,
      });
    }

    console.error('Error deleting review:', error);
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