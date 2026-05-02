import { Module } from '@nestjs/common';
import { CreateCategoryUseCase } from 'src/applications/categories/create-category.usecase';
import { DeleteCategoryUseCase } from 'src/applications/categories/delete-category.usecase';
import { GetCategoriesUseCase } from 'src/applications/categories/get-categories.usecase';
import { CategoryController } from 'src/interfaces/http/categories/category.controller';
import { JwtTokenService } from '../security/jwt.service';
import { JwtGuard } from '../security/jwt.guard';
import { CATEGORY_REPOSITORY } from 'src/domains/categories/category.token';
import { CategoryRepositoryPrisma } from '../repository/category-repository.prisma';

@Module({
  controllers: [CategoryController],
  providers: [
    CreateCategoryUseCase,
    GetCategoriesUseCase,
    DeleteCategoryUseCase,
    JwtTokenService,
    JwtGuard,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepositoryPrisma,
    },
  ],
})
export class CategoryModule {}
