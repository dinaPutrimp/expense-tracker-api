import { Test, TestingModule } from '@nestjs/testing';
import { GetCategoriesUseCase } from '../get-categories.usecase';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { Category } from 'src/domains/categories/entity/category.entity';

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;

  const mockCategoryRepo = { findAllByUserId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepo },
      ],
    }).compile();

    useCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
    jest.clearAllMocks();
  });

  it('should return all categories for a user', async () => {
    const mockCategories = [
      new Category('cat-1', 'Makan', 'user-id', new Date()),
      new Category('cat-2', 'Transport', 'user-id', new Date()),
    ];
    mockCategoryRepo.findAllByUserId.mockResolvedValue(mockCategories);

    const result = await useCase.execute('user-id');

    expect(mockCategoryRepo.findAllByUserId).toHaveBeenCalledWith('user-id');
    expect(result).toEqual(mockCategories);
  });

  it('should return empty array when user has no categories', async () => {
    mockCategoryRepo.findAllByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-id');

    expect(result).toEqual([]);
  });
});
