import { Test, TestingModule } from '@nestjs/testing';
import { GetMonthlyTransactionsUseCase } from '../use-case/get-monthly-transactions.usecase';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import { Transaction } from 'src/domains/transactions/entity/transaction.entity';

describe('GetMonthlyTransactionsUseCase', () => {
  let useCase: GetMonthlyTransactionsUseCase;

  const mockTransactionRepo = { findByMonth: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMonthlyTransactionsUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
      ],
    }).compile();

    useCase = module.get<GetMonthlyTransactionsUseCase>(
      GetMonthlyTransactionsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should return transactions for given month and year', async () => {
    const mockTransactions = [
      new Transaction(
        'trx-1',
        'user-id',
        50000,
        'EXPENSE',
        'cat-id',
        new Date(),
      ),
    ];
    mockTransactionRepo.findByMonth.mockResolvedValue(mockTransactions);

    const result = await useCase.execute('user-id', 5, 2026);

    expect(mockTransactionRepo.findByMonth).toHaveBeenCalledWith(
      'user-id',
      5,
      2026,
    );
    expect(result).toEqual(mockTransactions);
  });

  it('should return empty array when no transactions in that month', async () => {
    mockTransactionRepo.findByMonth.mockResolvedValue([]);

    const result = await useCase.execute('user-id', 5, 2026);

    expect(result).toEqual([]);
  });
});
