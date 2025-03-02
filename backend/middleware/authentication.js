import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authenticateToken = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token missing. Please provide a valid token.',
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired. Please login again.',
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({
        message: 'Invalid token. Please provide a valid token.',
      });
    } else {
      return res.status(403).json({
        message: 'Token verification failed. Please try again.',
      });
    }
  }
};

export { authenticateToken };
