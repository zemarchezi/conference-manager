import user from 'models/user.js';
import session from 'models/session.js';
import validator from 'models/validator.js';

async function login(credentials) {
  const { email, password } = credentials;

  const userByEmail = await user.findByEmail(email);

  console.log('User found:', userByEmail); // DEBUG

  if (!userByEmail) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await user.comparePassword(password, userByEmail.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  console.log('Creating session for user ID:', userByEmail.id); // DEBUG

  // Create session
  const newSession = await session.create(userByEmail.id);

  // Remove password from user object
  const { password: _, ...userWithoutPassword } = userByEmail;

  return {
    user: userWithoutPassword,
    session: newSession,
  };
}

async function logout(sessionToken) {
  await session.deleteByToken(sessionToken);
}

async function verifySession(sessionToken) {
  if (!sessionToken) {
    throw new validator.UnauthorizedError('No session token provided');
  }

  const sessionData = await session.findByToken(sessionToken);

  if (!sessionData) {
    throw new validator.UnauthorizedError('Invalid or expired session');
  }

  // Check if session is expired
  if (new Date(sessionData.expires_at) < new Date()) {
    await session.deleteByToken(sessionToken);
    throw new validator.UnauthorizedError('Session expired');
  }

  return sessionData;
}

export default {
  login,
  logout,
  verifySession,
};
