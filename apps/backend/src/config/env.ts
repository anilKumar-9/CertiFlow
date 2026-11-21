import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default('postgresql://certiflow:certiflow_secret@localhost:5432/certiflow_db?schema=public&connection_limit=10'),
  JWT_SECRET: z.string().default('certiflow-insecure-dev-jwt-access-secret-32-chars'),
  JWT_REFRESH_SECRET: z.string().default('certiflow-insecure-dev-jwt-refresh-secret-32-chars'),
  CSRF_SECRET: z.string().default('certiflow-insecure-dev-csrf-secret-32-chars'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_PATH: z.string().default('./uploads'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  PUBLIC_VERIFY_RATE_LIMIT_MAX: z.coerce.number().default(10),
});

export type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Invalid environment variables:', error.flatten().fieldErrors);
  }
  throw new Error('Environment configuration validation failed');
}

export const env = parsedEnv;
