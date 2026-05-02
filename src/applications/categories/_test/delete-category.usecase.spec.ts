import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCategoryUseCase } from '../delete-category.usecase';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { Category } from 'src/domains/categories/entity/category.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;

  const mockCategoryRepo = {
    findById: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCategoryUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepo },
      ],
    }).compile();

    useCase = module.get<DeleteCategoryUseCase>(DeleteCategoryUseCase);
    jest.clearAllMocks();
  });

  it('should delete category when user is the owner', async () => {
    const mockCategory = new Category('cat-id', 'Makan', 'user-id', new Date());
    mockCategoryRepo.findById.mockResolvedValue(mockCategory);
    mockCategoryRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('user-id', 'cat-id');

    expect(mockCategoryRepo.findById).toHaveBeenCalledWith('cat-id');
    expect(mockCategoryRepo.delete).toHaveBeenCalledWith('cat-id');
  });

  it('should throw NotFoundException when category does not exist', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('user-id', 'cat-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockCategoryRepo.delete).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not the owner', async () => {
    const mockCategory = new Category(
      'cat-id',
      'Makan',
      'other-user-id',
      new Date(),
    );
    mockCategoryRepo.findById.mockResolvedValue(mockCategory);

    await expect(useCase.execute('user-id', 'cat-id')).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockCategoryRepo.delete).not.toHaveBeenCalled();
  });
});
