import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CategoryRepository } from 'src/domains/categories/category.repository';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import type { TransactionRepository } from 'src/domains/transactions/transaction.repository';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';

@Injectable()
export class UpdateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: TransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    userId: string,
    transactionId: string,
    amount: number,
    categoryId: string,
  ) {
    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId) throw new ForbiddenException();

    const category = await this.categoryRepo.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId) throw new ForbiddenException();

    return this.transactionRepo.update(transactionId, amount, categoryId);
  }
}
