import controller from 'models/user.js';
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
    validator.validateUserCreation(request.body);

    const newUser = await controller.create({
      username: request.body.username,
      email: request.body.email,
      password: request.body.password,
    });

    delete newUser.password;
    return response.status(201).json(newUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({
        error: error.message,
        details: error.errors,
      });
    }

    if (error.message && error.message.includes('already exists')) {
      return response.status(400).json({
        error: 'User with this username or email already exists',
      });
    }

    console.error('Error creating user:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

async function listUsers(request, response) {
  try {
    const { limit, offset } = request.query;

    const users = await controller.findAll({
      limit: limit ? parseInt(limit) : 30,
      offset: offset ? parseInt(offset) : 0,
    });

    const sanitizedUsers = users.map((user) => {
      delete user.password;
      return user;
    });

    return response.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Error listing users:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}