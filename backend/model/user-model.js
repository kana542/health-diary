import promisePool from '../utils/database.js';
import bcrypt from 'bcryptjs';

const selectAllUsers = async () => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users',
    );
    console.log('selectAllUsers result', rows);
    return rows;
  } catch (error) {
    console.error('selectAllUsers error', error);
    throw new Error('Database error');
  }
};

const selectUserById = async (userId) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM Users WHERE user_id = ?',
      [userId],
    );
    console.log('selectUserById result', rows);
    return rows[0] || null;
  } catch (error) {
    console.error('selectUserById error', error);
    throw new Error('Database error');
  }
};

const insertUser = async (user) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)',
      [user.username, user.password, user.email],
    );
    console.log('insertUser result', result);
    return result.insertId;
  } catch (error) {
    console.error('insertUser error', error);
    throw new Error('Database error');
  }
};

const updateUser = async (userId, userData) => {
  try {
    let query = 'UPDATE Users SET ';
    const values = [];
    const updates = [];

    if (userData.username) {
      updates.push('username = ?');
      values.push(userData.username);
    }
    if (userData.email) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.password) {
      updates.push('password = ?');
      values.push(userData.password);
    }

    query += updates.join(', ');
    query += ' WHERE user_id = ?';
    values.push(userId);

    const [result] = await promisePool.query(query, values);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('updateUser error', error);
    throw new Error('Database error');
  }
};

const deleteUser = async (userId) => {
  try {
    const [result] = await promisePool.query(
      'DELETE FROM Users WHERE user_id = ?',
      [userId],
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('deleteUser error', error);
    throw new Error('Database error');
  }
};

const selectUserByUsername = async (username) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM Users WHERE username = ?',
      [username],
    );
    console.log('selectUserByUsername result', rows);
    return rows[0] || null;
  } catch (error) {
    console.error('selectUserByUsername error', error);
    throw new Error('Database error');
  }
};

export {
  selectAllUsers,
  selectUserById,
  insertUser,
  updateUser,
  deleteUser,
  selectUserByUsername,
};
