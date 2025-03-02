import express from 'express';
import {
  addUser,
  deleteUser,
  editUser,
  getUserById,
  getUsers,
} from '../controllers/user-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { isOwner, isAdmin } from '../middlewares/authorization.js';

const userRouter = express.Router();

userRouter
  .route('/')
  .get(authenticateToken, isAdmin, getUsers)
  .post(addUser);

userRouter
  .route('/:id')
  .get(authenticateToken, getUserById)
  .put(authenticateToken, isOwner, editUser)
  .delete(authenticateToken, isAdmin, deleteUser);

export default userRouter;
