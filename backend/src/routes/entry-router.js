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
import { body } from 'express-validator';
import { validationErrorHandler } from '../middlewares/error-handler.js';

const entryRouter = express.Router();

entryRouter
  .route('/')
  .post(
    authenticateToken,
    body('entry_date').notEmpty().isDate(),
    body('mood').trim().notEmpty().isLength({min: 3, max: 25}).escape(),
    body('weight').isFloat({min: 2, max: 200}),
    body('sleep_hours').isInt({min: 0, max: 24}),
    body('notes').trim().escape(),
    validationErrorHandler,
    postEntry
  )
  .get(authenticateToken, getEntries);

entryRouter
  .route('/:id')
  .get(authenticateToken, getEntryById)
  .put(
    authenticateToken,
    isOwner,
    body('entry_date').optional().isDate(),
    body('mood').optional().trim().notEmpty().isLength({min: 3, max: 25}).escape(),
    body('weight').optional().isFloat({min: 2, max: 200}),
    body('sleep_hours').optional().isInt({min: 0, max: 24}),
    body('notes').optional().trim().escape(),
    validationErrorHandler,
    updateEntryById
  )
  .delete(authenticateToken, isOwner, deleteEntryById);

export default entryRouter;
