import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', message: 'CivicPulse API is running' })
);
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;