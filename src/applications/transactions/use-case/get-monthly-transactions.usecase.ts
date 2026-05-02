import { Inject, Injectable } from '@nestjs/common';
import type { TransactionRepository } from 'src/domains/transactions/transaction.repository';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';

@Injectable()
export class GetMonthlyTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(userId: string, month: number, year: number) {
    return this.transactionRepo.findByMonth(userId, month, year);
  }
}
