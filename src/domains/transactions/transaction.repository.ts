import { Transaction } from './entity/transaction.entity';

export interface FindAllOptions {
  userId: string;
  page: number;
  limit: number;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
}

export interface MonthlyChart {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface TransactionRepository {
  create(
    userId: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE',
    categoryId: string,
  ): Promise<Transaction>;
  findAll(
    options: FindAllOptions,
  ): Promise<{ data: Transaction[]; total: number }>;
  findById(id: string): Promise<Transaction | null>;
  update(id: string, amount: number, categoryId: string): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<Transaction[]>;
  getMonthlyChart(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlyChart[]>;
}
