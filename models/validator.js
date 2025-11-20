import Joi from 'joi';

// Custom Error Classes
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Validation Schemas
export const schemas = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().min(3).max(50).required(),
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
  
  userCreation: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
  
  conferenceCreation: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    slug: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(2000).optional(),
    location: Joi.string().max(200).optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().min(Joi.ref('start_date')).required(),
  }),
};

// Validation Functions
export function validateEmail(email) {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  if (error) {
    throw new ValidationError('Invalid email address');
  }
  return true;
}

export function validatePassword(password) {
  const schema = Joi.string().min(8).required();
  const { error } = schema.validate(password);
  if (error) {
    throw new ValidationError('Password must be at least 8 characters long');
  }
  return true;
}

export function validateUsername(username) {
  const schema = Joi.string().min(3).max(50).required();
  const { error } = schema.validate(username);
  if (error) {
    throw new ValidationError('Username must be between 3 and 50 characters');
  }
  return true;
}

export function validateUserCreation(data) {
  const { error, value } = schemas.userCreation.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw new ValidationError('User validation failed', details);
  }

  return value;
}

export function validateConferenceCreation(data) {
  const { error, value } = schemas.conferenceCreation.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw new ValidationError('Conference validation failed', details);
  }

  return value;
}

export function validate(schema, data) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw new ValidationError('Validation failed', details);
  }

  return value;
}

export default {
  schemas,
  validateEmail,
  validatePassword,
  validateUsername,
  validateUserCreation,
  validateConferenceCreation,
  validate,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
