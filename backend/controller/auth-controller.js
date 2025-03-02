import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import {selectUserByUsername} from '../models/user-model.js';

const login = async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({message: 'Username and password are required.'});
  }

  try {
    const user = await selectUserByUsername(username);

    if (!user) {
      return res.status(401).json({message: 'Bad username/password.'});
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const userForToken = {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        user_level: user.user_level
      };

      const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      });

      return res.json({
        message: 'Login successful',
        user: userForToken,
        token
      });
    }

    return res.status(401).json({message: 'Bad username/password.'});
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({message: 'Server error'});
  }
};

const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({message: 'Server error'});
  }
};

export {login, getMe};
