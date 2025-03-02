import promisePool from '../utils/database.js';

const insertEntry = async (entry) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO DiaryEntries (user_id, entry_date, mood, weight, sleep_hours, notes) VALUES (?, ?, ?, ?, ? ,?)',
      [
        entry.user_id,
        entry.entry_date,
        entry.mood,
        entry.weight,
        entry.sleep_hours,
        entry.notes,
      ],
    );
    console.log('insertEntry', result);
    return result.insertId;
  } catch (error) {
    console.error(error);
    throw new Error('database error');
  }
};

const selectAllEntries = async () => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM DiaryEntries');
    return rows;
  } catch (error) {
    console.error('selectAllEntries error', error);
    throw new Error('database error');
  }
};

const selectEntryById = async (entryId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM DiaryEntries WHERE entry_id = ?',
      [entryId],
    );
    return rows[0];
  } catch (error) {
    console.error('selectEntryById error', error);
    throw new Error('database error');
  }
};

const selectEntriesByUserId = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM DiaryEntries WHERE user_id = ? ORDER BY entry_date DESC',
      [userId],
    );
    return rows;
  } catch (error) {
    console.error('selectEntriesByUserId error', error);
    throw new Error('database error');
  }
};

const updateEntry = async (entryId, entryData) => {
  try {
    let query = 'UPDATE DiaryEntries SET ';
    const values = [];
    const updates = [];

    if (entryData.mood) {
      updates.push('mood = ?');
      values.push(entryData.mood);
    }
    if (entryData.weight !== undefined) {
      updates.push('weight = ?');
      values.push(entryData.weight);
    }
    if (entryData.sleep_hours !== undefined) {
      updates.push('sleep_hours = ?');
      values.push(entryData.sleep_hours);
    }
    if (entryData.notes !== undefined) {
      updates.push('notes = ?');
      values.push(entryData.notes);
    }
    if (entryData.entry_date) {
      updates.push('entry_date = ?');
      values.push(entryData.entry_date);
    }

    query += updates.join(', ');
    query += ' WHERE entry_id = ?';
    values.push(entryId);

    const [result] = await promisePool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('updateEntry error', error);
    throw new Error('database error');
  }
};

const deleteEntry = async (entryId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM DiaryEntries WHERE entry_id = ?',
      [entryId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('deleteEntry error', error);
    throw new Error('database error');
  }
};

export {
  insertEntry,
  selectAllEntries,
  selectEntryById,
  selectEntriesByUserId,
  updateEntry,
  deleteEntry,
};
