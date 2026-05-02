import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { GetTransactionsUseCase } from '../use-case/get-transactions.usecase';
import { Test, TestingModule } from '@nestjs/testing';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';

describe('GetTransactionsUseCase', () => {
  let useCase: GetTransactionsUseCase;

  const mockTransactionRepo = { findAll: jest.fn() };

  const mockTransactions = [
    new Transaction('trx-1', 'user-id', 50000, 'EXPENSE', 'cat-id', new Date()),
    new Transaction('trx-2', 'user-id', 100000, 'INCOME', 'cat-id', new Date()),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
      ],
    }).compile();

    useCase = module.get<GetTransactionsUseCase>(GetTransactionsUseCase);
    jest.clearAllMocks();
  });

  it('should return paginated transactions', async () => {
    mockTransactionRepo.findAll.mockResolvedValue({
      data: mockTransactions,
      total: 2,
    });

    const result = await useCase.execute('user-id', 1, 10);

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith({
      userId: 'user-id',
      page: 1,
      limit: 10,
      type: undefined,
      categoryId: undefined,
    });
    expect(result).toEqual({ data: mockTransactions, total: 2 });
  });

  it('should pass type and categoryId filter', async () => {
    mockTransactionRepo.findAll.mockResolvedValue({
      data: [mockTransactions[0]],
      total: 1,
    });

    await useCase.execute('user-id', 1, 10, 'EXPENSE', 'cat-id');

    expect(mockTransactionRepo.findAll).toHaveBeenCalledWith({
      userId: 'user-id',
      page: 1,
      limit: 10,
      type: 'EXPENSE',
      categoryId: 'cat-id',
    });
  });
});
