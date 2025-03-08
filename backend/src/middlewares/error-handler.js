import {validationResult} from 'express-validator';

/**
 * Error generator function
 * @param {string} message - error message
 * @param {number} status - http status code
 * @returns error object
 */
const customError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Custom middleware for handling and formatting validation errors
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next function
 * @return {*} next function call
 */
const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req, {strictParams: ['body']});
  if (!errors.isEmpty()) {
    const error = new Error('Bad Request');
    error.status = 400;
    error.errors = errors.array({onlyFirstError: true}).map((error) => {
      return {field: error.path, message: error.msg};
    });
    return next(error);
  }
  next();
};

/**
 * Custom default middleware for handling errors
 * @param {object} err - error object
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {function} next - next function
 * @returns {object} response object with error details
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    errors: err.errors
  });
};

export {errorHandler, validationErrorHandler, customError};
