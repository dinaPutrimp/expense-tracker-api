export type TransactionType = 'INCOME' | 'EXPENSE';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    public readonly categoryId: string,
    public readonly createdAt: Date,
  ) {}
}
