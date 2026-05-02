import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryUseCase } from 'src/applications/categories/create-category.usecase';
import { DeleteCategoryUseCase } from 'src/applications/categories/delete-category.usecase';
import { GetCategoriesUseCase } from 'src/applications/categories/get-categories.usecase';
import { JwtGuard } from 'src/infrastructures/security/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateCategoryDto } from './category.dto';

@UseGuards(JwtGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.createCategoryUseCase.execute(user.userId, dto.name);
  }

  @Get()
  getAll(@CurrentUser() user: { userId: string }) {
    return this.getCategoriesUseCase.execute(user.userId);
  }

  @Delete(':id')
  delete(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.deleteCategoryUseCase.execute(user.userId, id);
  }
}
