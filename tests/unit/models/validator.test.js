import validator from 'models/validator.js';

describe('Email Validation', () => {
  test('Valid email addresses', () => {
    expect(validator.validateEmail('user@example.com')).toBe(true);
    expect(validator.validateEmail('test.user@domain.co.uk')).toBe(true);
  });

  test('Invalid email addresses', () => {
    expect(validator.validateEmail('invalid')).toBe(false);
    expect(validator.validateEmail('@example.com')).toBe(false);
    expect(validator.validateEmail('user@')).toBe(false);
  });
});

describe('Username Validation', () => {
  test('Valid usernames', () => {
    expect(validator.validateUsername('user123')).toBe(true);
    expect(validator.validateUsername('test_user')).toBe(true);
  });

  test('Invalid usernames', () => {
    expect(validator.validateUsername('ab')).toBe(false); // too short
    expect(validator.validateUsername('user@name')).toBe(false); // invalid char
  });
});

describe('Password Validation', () => {
  test('Valid passwords', () => {
    expect(validator.validatePassword('password123')).toBe(true);
  });

  test('Invalid passwords', () => {
    expect(validator.validatePassword('short')).toBe(false); // too short
    expect(validator.validatePassword('')).toBe(false);
  });
});

describe('Review Submission Validation', () => {
  test('Valid review data', () => {
    expect(() => {
      validator.validateReviewSubmission({
        abstract_id: 1,
        score: 8,
        recommendation: 'accept',
      });
    }).not.toThrow();
  });

  test('Invalid score throws error', () => {
    expect(() => {
      validator.validateReviewSubmission({
        abstract_id: 1,
        score: 11, // invalid
        recommendation: 'accept',
      });
    }).toThrow(validator.ValidationError);
  });

  test('Invalid recommendation throws error', () => {
    expect(() => {
      validator.validateReviewSubmission({
        abstract_id: 1,
        score: 8,
        recommendation: 'maybe', // invalid
      });
    }).toThrow(validator.ValidationError);
  });
});