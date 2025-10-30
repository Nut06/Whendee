import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, 'DATABASE_URL is required'),
  USER_SERVICE_URL: z
    .string()
    .trim()
    .url()
    .optional(),
  USER_SERVICE_TIMEOUT_MS: z
    .coerce.number()
    .int()
    .min(500)
    .max(10000)
    .default(3000),
  SKIP_USER_VALIDATION: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export const env = envSchema.parse(process.env);
