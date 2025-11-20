import { query } from './db.js';

export async function createScheduleItem(conferenceId, scheduleData) {
  const { title, description, start_time, end_time, location, speaker } = scheduleData;
  
  const result = await query(
    `INSERT INTO schedule_items (conference_id, title, description, start_time, end_time, location, speaker, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [conferenceId, title, description, start_time, end_time, location, speaker]
  );
  
  return result.rows[0];
}

export async function getScheduleByConference(conferenceId) {
  const result = await query(
    `SELECT * FROM schedule_items 
     WHERE conference_id = $1 
     ORDER BY start_time ASC`,
    [conferenceId]
  );
  
  return result.rows;
}

export async function getScheduleItemById(id) {
  const result = await query(
    `SELECT * FROM schedule_items WHERE id = $1`,
    [id]
  );
  
  return result.rows[0];
}

export async function updateScheduleItem(id, scheduleData) {
  const { title, description, start_time, end_time, location, speaker } = scheduleData;
  
  const result = await query(
    `UPDATE schedule_items 
     SET title = $1, description = $2, start_time = $3, end_time = $4, 
         location = $5, speaker = $6, updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [title, description, start_time, end_time, location, speaker, id]
  );
  
  return result.rows[0];
}

export async function deleteScheduleItem(id) {
  await query(
    `DELETE FROM schedule_items WHERE id = $1`,
    [id]
  );
}

export default {
  createScheduleItem,
  getScheduleByConference,
  getScheduleItemById,
  updateScheduleItem,
  deleteScheduleItem,
};
