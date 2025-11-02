import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, 'DATABASE_URL is required'),
  INVITE_LINK_BASE_URL: z
    .string()
    .trim()
    .url()
    .default('https://example.com/invite'),
  INVITATION_TTL_MINUTES: z
    .coerce.number()
    .int()
    .min(5)
    .max(60 * 24 * 14) // up to 2 weeks
    .default(60),
  USER_SERVICE_URL: z
    .string()
    .trim()
    .url()
    .optional(),
  NOTIFICATION_PROVIDER: z
    .string()
    .trim()
    .optional(),
  SKIP_USER_VALIDATION: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export const env = envSchema.parse(process.env);
