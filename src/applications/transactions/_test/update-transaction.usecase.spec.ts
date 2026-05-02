import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { UpdateTransactionUseCase } from '../use-case/update-transaction.usecase';
import { Category } from 'src/domains/categories/entity/category.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UpdateTransactionUseCase', () => {
  let useCase: UpdateTransactionUseCase;

  const mockTransactionRepo = { findById: jest.fn(), update: jest.fn() };
  const mockCategoryRepo = { findById: jest.fn() };

  const mockTransaction = new Transaction(
    'trx-id',
    'user-id',
    50000,
    'EXPENSE',
    'cat-id',
    new Date(),
  );
  const mockCategory = new Category('cat-id', 'Makan', 'user-id', new Date());

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepo },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionUseCase>(UpdateTransactionUseCase);
    jest.clearAllMocks();
  });

  it('should update and return the transaction', async () => {
    const updated = new Transaction(
      'trx-id',
      'user-id',
      75000,
      'EXPENSE',
      'cat-id',
      new Date(),
    );
    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockCategoryRepo.findById.mockResolvedValue(mockCategory);
    mockTransactionRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('user-id', 'trx-id', 75000, 'cat-id');

    expect(mockTransactionRepo.update).toHaveBeenCalledWith(
      'trx-id',
      75000,
      'cat-id',
    );
    expect(result).toEqual(updated);
  });

  it('should throw NotFoundException when transaction not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id', 'trx-id', 75000, 'cat-id'),
    ).rejects.toThrow(NotFoundException);
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

    await expect(
      useCase.execute('user-id', 'trx-id', 75000, 'cat-id'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when category not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id', 'trx-id', 75000, 'cat-id'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when category belongs to another user', async () => {
    const otherCategory = new Category(
      'cat-id',
      'Makan',
      'other-user-id',
      new Date(),
    );
    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockCategoryRepo.findById.mockResolvedValue(otherCategory);

    await expect(
      useCase.execute('user-id', 'trx-id', 75000, 'cat-id'),
    ).rejects.toThrow(ForbiddenException);
  });
});
