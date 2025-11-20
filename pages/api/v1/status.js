import database from 'infra/database.js';

export default async function handler(request, response) {
  try {
    const databaseStatus = await database.query('SELECT 1 + 1 as result;');
    
    return response.status(200).json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: databaseStatus.rows.length > 0 ? 'connected' : 'disconnected',
    });
  } catch (error) {
    return response.status(503).json({
      status: 'error',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
}