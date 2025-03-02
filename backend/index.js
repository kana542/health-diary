import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import userRouter from './routes/user-router.js';
import authRouter from './routes/auth-router.js';
import entryRouter from './routes/entry-router.js';
import { errorHandler } from './utils/error-handler.js';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Health Diary API' });
});

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/entries', entryRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
