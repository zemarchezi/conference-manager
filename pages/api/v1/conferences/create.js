import conference from 'models/conference.js';
import organization from 'models/organization.js';
import validator from 'models/validator.js';
import authorization from 'models/authorization.js';
import session from 'models/session.js';
import user from 'models/user.js';
import { sendConferenceCreatedEmail } from 'models/emails/conference-created.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authorization
    const canCreate = await authorization.canRequest('create:conference', request);
    if (!canCreate) {
      throw new validator.UnauthorizedError('User must be authenticated to create conferences');
    }

    // Get current user from session
    const sessionToken = getSessionToken(request);
    const sessionObj = await session.findOneValidByToken(sessionToken);
    const currentUser = await user.findById(sessionObj.user_id);

    // Validate required fields
    const errors = [];
    if (!request.body.title) errors.push({ field: 'title', message: 'Title is required' });
    if (!request.body.description) errors.push({ field: 'description', message: 'Description is required' });
    if (!request.body.start_date) errors.push({ field: 'start_date', message: 'Start date is required' });
    if (!request.body.end_date) errors.push({ field: 'end_date', message: 'End date is required' });

    if (errors.length > 0) {
      throw new validator.ValidationError(errors);
    }

    // Validate dates
    const startDate = new Date(request.body.start_date);
    const endDate = new Date(request.body.end_date);
    
    if (endDate < startDate) {
      throw new validator.ValidationError([
        { field: 'end_date', message: 'End date must be after start date' },
      ]);
    }

    // Verify organization ownership if provided
    let organizationId = request.body.organization_id;
    if (organizationId) {
      const org = await organization.findById(organizationId);
      if (!org || org.owner_id !== currentUser.id) {
        return response.status(403).json({
          error: 'You do not have permission to create conferences for this organization',
        });
      }
    }

    // Prepare conference data with settings
    const conferenceData = {
      title: request.body.title,
      description: request.body.description,
      start_date: request.body.start_date,
      end_date: request.body.end_date,
      location: request.body.location || '',
      submission_deadline: request.body.submission_deadline || null,
      organizer_id: currentUser.id,
      organization_id: organizationId || null,
      status: 'draft',
    };

    // Create conference (will auto-assign organizer role via model)
    const newConference = await conference.create(conferenceData);

    // Store additional settings if provided
    if (request.body.settings) {
      await storeConferenceSettings(newConference.id, request.body.settings);
    }

    // Send onboarding email
    try {
      await sendConferenceCreatedEmail({
        email: currentUser.email,
        username: currentUser.username,
        conference: newConference,
      });
    } catch (emailError) {
      console.error('Failed to send conference creation email:', emailError);
      // Don't fail the request if email fails
    }

    return response.status(201).json(newConference);
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

    console.error('Error creating conference:', error);
    return response.status(500).json({
      error: 'Internal server error',
    });
  }
}

async function storeConferenceSettings(conferenceId, settings) {
  // This will be implemented when we add a conference_settings table
  // For now, we can store in the conference record or skip
  // TODO: Implement conference settings storage
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