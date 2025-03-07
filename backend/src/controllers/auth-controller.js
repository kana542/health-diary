import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { selectUserByUsername } from "../models/user-model.js";
import logger from '../utils/logger.js';
import { customError } from '../middlewares/error-handler.js';

/**
 * Käsittelee käyttäjän kirjautumisen
 */
const login = async (req, res, next) => {
   const { username, password } = req.body;

   if (!username || !password) {
      logger.warn(`Kirjautumisyritys ilman käyttäjätunnusta tai salasanaa`);
      return next(customError('Username and password are required.', 400));
   }

   try {
      logger.info(`Kirjautumisyritys käyttäjänimellä: ${username}`);
      const user = await selectUserByUsername(username);

      if (!user) {
         logger.warn(`Kirjautuminen epäonnistui: käyttäjää '${username}' ei löydy`);
         return next(customError('Bad username/password.', 401));
      }

      const match = await bcrypt.compare(password, user.password);

      if (match) {
         const userForToken = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            user_level: user.user_level,
         };

         const token = jwt.sign(userForToken, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "24h",
         });

         logger.info(`Käyttäjä '${username}' kirjautui onnistuneesti (ID: ${user.user_id})`);
         return res.json({
            message: "Login successful",
            user: userForToken,
            token,
         });
      }

      logger.warn(`Kirjautuminen epäonnistui: väärä salasana käyttäjälle '${username}'`);
      return next(customError('Bad username/password.', 401));
   } catch (error) {
      logger.error("Kirjautumisvirhe:", error);
      return next(customError('Server error', 500));
   }
};

/**
 * Hakee kirjautuneen käyttäjän tiedot
 */
const getMe = async (req, res, next) => {
   try {
      logger.info(`Käyttäjän tiedot haettu: ${req.user.username} (ID: ${req.user.user_id})`);
      res.json(req.user);
   } catch (error) {
      logger.error("getMe-virhe:", error);
      next(customError('Server error', 500));
   }
};

export { login, getMe };
