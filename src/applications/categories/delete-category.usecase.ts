import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CategoryRepository } from 'src/domains/categories/category.repository';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(userId: string, categoryId: string) {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId) throw new ForbiddenException();
    await this.categoryRepo.delete(categoryId);
  }
}
