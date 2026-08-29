import express from 'express';
import cors from 'cors';
import router from './routes/transactionRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'triage-api',
    })
})

app.use('/api/transactions', router)

export default app;