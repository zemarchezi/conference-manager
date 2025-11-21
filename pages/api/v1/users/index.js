import user from 'models/user.js';
import validator from 'models/validator.js';

export default async function handler(request, response) {
  if (request.method === 'POST') {
    return await createUser(request, response);
  }

  if (request.method === 'GET') {
    return await listUsers(request, response);
  }

  return response.status(405).json({ error: 'Method not allowed' });
}

async function createUser(request, response) {
  try {
    // Validate user data
    if (!request.body.username || !request.body.email || !request.body.password) {
      return response.status(400).json({
        error: 'Username, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await user.findByEmail(request.body.email);
    if (existingUser) {
      return response.status(400).json({
        error: 'User with this email already exists',
      });
    }

    const existingUsername = await user.findByUsername(request.body.username);
    if (existingUsername) {
      return response.status(400).json({
        error: 'Username already taken',
      });
    }

    const newUser = await user.create({
      username: request.body.username,
      email: request.body.email,
      password: request.body.password,
    });

    // Add default features for platform users (can create conferences)
    await user.addFeatures(newUser.id, [
      'read:user',
      'update:user',
      'create:conference',
      'create:abstract',
      'create:review',
    ]);

    delete newUser.password;
    return response.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listUsers(request, response) {
  try {
    const users = await user.findAll();
    return response.status(200).json(users);
  } catch (error) {
    console.error('Error listing users:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}