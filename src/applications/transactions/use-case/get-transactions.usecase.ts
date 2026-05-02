import { Inject, Injectable } from '@nestjs/common';
import type { TransactionRepository } from 'src/domains/transactions/transaction.repository';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
    type?: 'INCOME' | 'EXPENSE',
    categoryId?: string,
  ) {
    return this.transactionRepo.findAll({
      userId,
      page,
      limit,
      type,
      categoryId,
    });
  }
}
