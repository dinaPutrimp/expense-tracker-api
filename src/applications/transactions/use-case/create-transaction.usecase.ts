import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { nanoid } from 'nanoid';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import type { TransactionRepository } from 'src/domains/transactions/transaction.repository';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import type { CategoryRepository } from 'src/domains/categories/category.repository';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepo: TransactionRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    userId: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE',
    categoryId: string,
  ) {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId) throw new ForbiddenException();

    return this.transactionRepo.create(userId, amount, type, categoryId);
  }
}
