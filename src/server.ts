import dotenv from 'dotenv';
import app from './app';
import { sweepPendingTransactions } from './services/sweepService';


dotenv.config();

const PORT = process.env.PORT || 3000;

const SWEEP_INTERVAL_MINUTES = 15;

const runSweep = async () => {
    try {
        const result = await sweepPendingTransactions();
        console.log(`Sweep checked ${result.checked} pending transactions, flagged ${result.flagged}`);
    } catch (error) {
        console.error('Sweep failed', error);
    }
};

app.listen(PORT, () => {
    console.log(`Triage Server is running on port ${PORT}`);

    runSweep();
    setInterval(runSweep, SWEEP_INTERVAL_MINUTES * 60 * 1000);
})
