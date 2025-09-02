import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';
import locationRoutes from './routes/location';
import weatherRoutes from './routes/weather';
import historicalRoutes from './routes/historical';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/location', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/historical', historicalRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  logger.info(`🌍 ClimateTime API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});