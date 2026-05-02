import { Module } from '@nestjs/common';
import { CreateTransactionUseCase } from 'src/applications/transactions/use-case/create-transaction.usecase';
import { TransactionController } from 'src/interfaces/http/transactions/transaction.controller';
import { TransactionRepositorySupabase } from '../supabase/transaction-supabase.repository';
import { GetTransactionsUseCase } from 'src/applications/transactions/use-case/get-transactions.usecase';
import { UpdateTransactionUseCase } from 'src/applications/transactions/use-case/update-transaction.usecase';
import { DeleteTransactionUseCase } from 'src/applications/transactions/use-case/delete-transaction.usecase';
import { GetMonthlyTransactionsUseCase } from 'src/applications/transactions/use-case/get-monthly-transactions.usecase';
import { GetMonthlyChartUseCase } from 'src/applications/transactions/use-case/get-monthly-chart.usecase';
import { JwtTokenService } from '../security/jwt.service';
import { JwtGuard } from '../security/jwt.guard';
import { TransactionRepositoryPrisma } from '../repository/transaction-repository.prisma';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { CategoryRepositoryPrisma } from '../repository/category-repository.prisma';

@Module({
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    GetTransactionsUseCase,
    UpdateTransactionUseCase,
    DeleteTransactionUseCase,
    GetMonthlyTransactionsUseCase,
    GetMonthlyChartUseCase,
    JwtTokenService,
    JwtGuard,
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TransactionRepositoryPrisma,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepositoryPrisma,
    },
  ],
})
export class TransactionModule {}
