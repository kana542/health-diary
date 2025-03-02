import express from 'express';
import {
  getEntries,
  getEntryById,
  postEntry,
  updateEntryById,
  deleteEntryById
} from '../controllers/entry-controller.js';
import { authenticateToken } from '../middlewares/authentication.js';
import { isOwner } from '../middlewares/authorization.js';

const entryRouter = express.Router();

entryRouter
  .route('/')
  .post(authenticateToken, postEntry)
  .get(authenticateToken, getEntries);

entryRouter
  .route('/:id')
  .get(authenticateToken, getEntryById)
  .put(authenticateToken, isOwner, updateEntryById)
  .delete(authenticateToken, isOwner, deleteEntryById);

export default entryRouter;
