import { Inject, Injectable } from '@nestjs/common';
import type { CategoryRepository } from 'src/domains/categories/category.repository';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';

@Injectable()
export class GetCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(userId: string) {
    return this.categoryRepo.findAllByUserId(userId);
  }
}
