import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { DeleteTransactionUseCase } from '../use-case/delete-transaction.usecase';
import { Test, TestingModule } from '@nestjs/testing';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DeleteTransactionUseCase', () => {
  let useCase: DeleteTransactionUseCase;

  const mockTransactionRepo = { findById: jest.fn(), delete: jest.fn() };

  const mockTransaction = new Transaction(
    'trx-id',
    'user-id',
    50000,
    'EXPENSE',
    'cat-id',
    new Date(),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTransactionUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
      ],
    }).compile();

    useCase = module.get<DeleteTransactionUseCase>(DeleteTransactionUseCase);
    jest.clearAllMocks();
  });

  it('should delete the transaction', async () => {
    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockTransactionRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('user-id', 'trx-id');

    expect(mockTransactionRepo.findById).toHaveBeenCalledWith('trx-id');
    expect(mockTransactionRepo.delete).toHaveBeenCalledWith('trx-id');
  });

  it('should throw NotFoundException when transaction not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id', 'trx-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockTransactionRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when transaction belongs to another user', async () => {
    const otherTransaction = new Transaction(
      'trx-id',
      'other-user-id',
      50000,
      'EXPENSE',
      'cat-id',
      new Date(),
    );
    mockTransactionRepo.findById.mockResolvedValue(otherTransaction);

    await expect(useCase.execute('user-id', 'trx-id')).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockTransactionRepo.delete).not.toHaveBeenCalled();
  });
});
