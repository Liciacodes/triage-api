import express from 'express';
import cors from 'cors';
import transactionRouter from './routes/transactionRoutes';
import alertRouter from './routes/alertRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'triage-api',
    })
})

app.use('/api/transactions', transactionRouter);
app.use('/api/alerts', alertRouter);

export default app;