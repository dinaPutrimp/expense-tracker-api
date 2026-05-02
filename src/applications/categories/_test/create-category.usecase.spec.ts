import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryUseCase } from '../create-category.usecase';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { Category } from 'src/domains/categories/entity/category.entity';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;

  const mockCategoryRepo = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: mockCategoryRepo },
      ],
    }).compile();

    useCase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
    jest.clearAllMocks();
  });

  it('should create and return a category', async () => {
    const mockCategory = new Category('cat-id', 'Makan', 'user-id', new Date());
    mockCategoryRepo.create.mockResolvedValue(mockCategory);

    const result = await useCase.execute('user-id', 'Makan');

    expect(mockCategoryRepo.create).toHaveBeenCalledWith('user-id', 'Makan');
    expect(result).toEqual(mockCategory);
  });
});
