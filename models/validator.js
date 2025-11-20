import Joi from 'joi';

export const schemas = {
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  username: Joi.string().min(3).max(50).required(),
  title: Joi.string().min(3).max(200).required(),
  slug: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
};

export function validateEmail(email) {
  const schema = Joi.string().email().required();
  const { error } = schema.validate(email);
  return !error;
}

export function validatePassword(password) {
  const schema = Joi.string().min(8).required();
  const { error } = schema.validate(password);
  return !error;
}

export function validateUsername(username) {
  const schema = Joi.string().min(3).max(50).required();
  const { error } = schema.validate(username);
  return !error;
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
    return { valid: false, errors: details };
  }

  return { valid: true, value };
}

export default {
  schemas,
  validateEmail,
  validatePassword,
  validateUsername,
  validate,
};