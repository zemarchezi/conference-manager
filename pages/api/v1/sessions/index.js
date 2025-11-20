import authentication from 'models/authentication.js';
import session from 'models/session.js';
import validator from 'models/validator.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await login(request, response);
  }

  if (request.method === 'DELETE') {
    return await logout(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function login(request, response) {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new validator.ValidationError([
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' },
      ]);
    }

    // authentication.login returns { user, session }
    const result = await authentication.login({
      email,
      password,
    });

    // Set the session token in a cookie
    response.setHeader(
      'Set-Cookie',
      `session_id=${result.session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    );

    return response.status(201).json({
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      features: result.user.features,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    if (error.message === 'Invalid credentials') {
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    console.error('Error during login:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function logout(request, response) {
  try {
    const sessionToken = getSessionToken(request);

    if (!sessionToken) {
      throw new validator.UnauthorizedError('No session found');
    }

    await session.deleteByToken(sessionToken);

    response.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

    return response.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error.name === 'UnauthorizedError') {
      return response.status(401).json({ error: error.message });
    }

    console.error('Error during logout:', error);
    return response.status(500).json({ error: 'Internal server error' });
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
