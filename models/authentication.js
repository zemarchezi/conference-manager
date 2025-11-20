import database from 'infra/database.js';
import session from 'models/session.js';
import user from 'models/user.js';

async function login(credentials) {
  const { email, password } = credentials;

  const userByEmail = await user.findOneByEmail(email);

  if (!userByEmail) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await user.comparePasswords(password, userByEmail.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const sessionObj = await session.create(userByEmail.id);

  return {
    user: user.removePasswordFromUser(userByEmail),
    session: sessionObj,
  };
}

async function logout(sessionToken) {
  await session.expireById(sessionToken);
}

export default Object.freeze({
  login,
  logout,
});
