import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string(),
    PORT: z.coerce.number().default(3333),
    PASS_NUMBER_TEST: z.string().default('555159')
})

export const env = envSchema.parse(process.env)
