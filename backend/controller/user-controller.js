import bcrypt from 'bcryptjs';
import {
  insertUser,
  selectAllUsers,
  selectUserById,
  updateUser,
  deleteUser as deleteUserFromModel,
} from '../models/user-model.js';

const getUsers = async (req, res) => {
  try {
    const users = await selectAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await selectUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

const addUser = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.get('Content-Type'));

  const {username, password, email} = req.body;

  console.log('Parsed values:', {username, password, email});

  try {
    if (!username || !password || !email) {
      console.log('Missing required fields:', {
        username: !!username,
        password: !!password,
        email: !!email,
      });
      return res.status(400).json({
        message: 'Request should have username, password and email properties.',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = {
      username,
      password: passwordHash,
      email,
    };

    const result = await insertUser(newUser);
    res.status(201).json({
      message: 'User added.',
      user_id: result,
    });
  } catch (error) {
    console.error('Error in addUser:', error);
    res.status(500).json({message: error.message});
  }
};

const editUser = async (req, res) => {
  const {username, password, email} = req.body;

  try {
    let updateData = {
      username,
      email,
    };

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const result = await updateUser(req.params.id, updateData);

    if (result) {
      res.json({message: 'User updated.'});
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await deleteUserFromModel(req.params.id); // Fixed recursive call
    if (result) {
      res.json({message: 'User deleted.'});
    } else {
      res.status(404).json({message: 'User not found'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export {getUsers, getUserById, addUser, editUser, deleteUser};
