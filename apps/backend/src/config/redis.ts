import { Redis } from 'ioredis';
import { env } from './env.js';

let redisInstance: Redis | null = null;
let lastLoggedErrorTime = 0;
let hasLoggedDisconnectWarning = false;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      enableOfflineQueue: false, // Prevent unhandled rejection / queue buildup when Redis is offline
      retryStrategy(times) {
        // Back off progressively: retry after 2s, 4s, then every 30s
        if (times > 3) {
          return 30000; // Retry once every 30 seconds
        }
        return Math.min(times * 2000, 10000);
      },
    });

    redisInstance.on('error', (err: any) => {
      const now = Date.now();
      // Throttle error notifications to at most once every 30 seconds to prevent console flooding
      if (process.env.NODE_ENV !== 'test' && now - lastLoggedErrorTime > 30000) {
        lastLoggedErrorTime = now;
        const errDetail = err?.code || err?.message || 'ECONNREFUSED';
        
        if (!hasLoggedDisconnectWarning) {
          hasLoggedDisconnectWarning = true;
          console.warn(`\n[Redis Notice] Cannot connect to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT} (${errDetail}).`);
          console.warn(`[Redis Notice] The backend API will continue running in degraded mode (caching disabled).`);
          console.warn(`[Redis Notice] To enable Redis, start Docker Desktop and run: docker-compose up -d redis\n`);
        } else {
          console.warn(`[Redis Notice] Still attempting reconnection to ${env.REDIS_HOST}:${env.REDIS_PORT} (next attempt in 30s)...`);
        }
      }
    });

    redisInstance.on('connect', () => {
      hasLoggedDisconnectWarning = false;
      console.log(`[Redis] Connected successfully to ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    });
  }
  return redisInstance;
}

export const redis = getRedisClient();
export const redisClient = redis;

export async function checkRedisHealth(): Promise<boolean> {
  try {
    if (!redisInstance || redisInstance.status !== 'ready') {
      return false;
    }
    const res = await redis.ping();
    return res === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit().catch(() => {});
    redisInstance = null;
  }
}
