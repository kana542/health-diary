import jwt from 'jsonwebtoken';
import 'dotenv/config';
import logger from '../utils/logger.js';

const authenticateToken = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Autentikointi epäonnistui: Token puuttuu');
    return res.status(401).json({
      message: 'Authentication token missing. Please provide a valid token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Lisää lokitus onnistuneelle tokenauthentikoinnille, mutta rajoita määrää
    // API-pyyntöjen loput tiedot näkyvät muissa lokeissa
    if (req.path !== '/entries') {
      logger.info(`Token autentikoitu onnistuneesti: ${req.user.username} (ID: ${req.user.user_id})`);
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`Token vanhentunut käyttäjälle: ${err.message}`);
      return res.status(401).json({
        message: 'Token has expired. Please login again.',
      });
    } else if (err.name === 'JsonWebTokenError') {
      logger.warn(`Virheellinen token: ${err.message}`);
      return res.status(403).json({
        message: 'Invalid token. Please provide a valid token.',
      });
    } else {
      logger.error(`Token-virhe: ${err.message}`);
      return res.status(403).json({
        message: 'Token verification failed. Please try again.',
      });
    }
  }
};

export { authenticateToken };
