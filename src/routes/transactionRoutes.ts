import { Router } from "express";
import { evaluateTransaction } from "../rules/evaluateTransaction";
import { transactionSchema } from "../schemas/transactionSchema";

const router = Router()

router.post('/evaluate' , (req, res) => {
      console.log("EVALUATE ROUTE WITH ZOD");
const parsed = transactionSchema.safeParse(req.body)

if (!parsed.success) {
    return res.status(400).json({
        error: 'Invalid transaction data',
        details: parsed.error.issues,
    })
}

const transaction = parsed.data;

const issues = evaluateTransaction(transaction)

res.status(200).json({
    needsAttention: issues.length > 0,
    issues,
})

})

export default router;