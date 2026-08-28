export type TransactionStatus = 'pending' | 'success' | 'failed' | 'reversed';

export interface Transaction {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    customerEmail: string;
    status: TransactionStatus;
    createdAt: Date;
    updatedAt: Date; 
    
    expectedSettlement?: number;
    actualSettlement?: number;
}