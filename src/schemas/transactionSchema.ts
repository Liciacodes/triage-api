import { z } from 'zod';

export const transactionSchema = z.object({
    id: z.string(),
    reference: z.string(),
    amount: z.number().positive(),
    currency: z.string().min(3),
    customerEmail: z.string().email(),

    status: z.enum([
        'pending',
        'success',
        'failed',
        'reversed'
    ]),

    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),

    expectedSettlement: z.number().optional(),
    actualSettlement: z.number().optional(),
})

export type ValidatedTransaction = z.infer<typeof transactionSchema>;