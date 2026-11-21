import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { checkRedisHealth } from './config/redis.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/security.js';
import { SseManager } from './modules/events/sseManager.js';

// Modular Route Handlers
import { authRouter } from './modules/auth/authRoutes.js';
import { batchRouter } from './modules/batches/batchRoutes.js';
import { districtRouter } from './modules/district/districtRoutes.js';
import { qualityRouter } from './modules/quality/qualityRoutes.js';
import { stateRouter } from './modules/state/stateRoutes.js';
import { verificationRouter } from './modules/verification/verificationRoutes.js';
import { sseRouter } from './modules/events/sseRoutes.js';
import { reportsRouter } from './modules/reports/reportsRoutes.js';

const app = express();

// Initialize real-time SSE heartbeat
SseManager.initialize();

// Security Perimeter
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(generalRateLimiter);

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'degraded';
  }

  const isRedisOk = await checkRedisHealth();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      database: dbStatus,
      redis: isRedisOk ? 'connected' : 'degraded',
    },
    version: '1.0.0',
  });
});

// Version 1 API Root & Modular Routes
const apiV1Router = express.Router();

apiV1Router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'active',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/batches', batchRouter);
apiV1Router.use('/district', districtRouter);
apiV1Router.use('/quality', qualityRouter);
apiV1Router.use('/state', stateRouter);
apiV1Router.use('/verification', verificationRouter);
apiV1Router.use('/events', sseRouter);
apiV1Router.use('/reports', reportsRouter);

app.use('/api/v1', apiV1Router);

// Centralized Error Handling
app.use(errorHandler);

export { app };
export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`[CertiFlow API] Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}
