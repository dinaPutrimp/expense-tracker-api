import { Category } from 'src/domains/categories/entity/category.entity';
import { CreateTransactionUseCase } from '../use-case/create-transaction.usecase';
import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;

  const mockTransactionRepo = { create: jest.fn() };
  const mockCategoryRepo = { findById: jest.fn() };

  const mockCategory = new Category('cat-id', 'Makan', 'user-id', new Date());
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
        CreateTransactionUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepo },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    jest.clearAllMocks();
  });

  it('should create and return a transaction', async () => {
    mockCategoryRepo.findById.mockResolvedValue(mockCategory);
    mockTransactionRepo.create.mockResolvedValue(mockTransaction);

    const result = await useCase.execute('user-id', 50000, 'EXPENSE', 'cat-id');

    expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-id');
    expect(mockTransactionRepo.create).toHaveBeenCalledWith(
      'user-id',
      50000,
      'EXPENSE',
      'cat-id',
    );
    expect(result).toEqual(mockTransaction);
  });

  it('should throw NotFoundException when category not found', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('user-id', 50000, 'EXPENSE', 'cat-id'),
    ).rejects.toThrow(NotFoundException);

    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when category belongs to another user', async () => {
    const otherUserCategory = new Category(
      'cat-id',
      'Makan',
      'other-user-id',
      new Date(),
    );
    mockCategoryRepo.findById.mockResolvedValue(otherUserCategory);

    await expect(
      useCase.execute('user-id', 50000, 'EXPENSE', 'cat-id'),
    ).rejects.toThrow(ForbiddenException);

    expect(mockTransactionRepo.create).not.toHaveBeenCalled();
  });
});
