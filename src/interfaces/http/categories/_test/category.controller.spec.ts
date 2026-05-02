import {
  ForbiddenException,
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { CreateCategoryUseCase } from 'src/applications/categories/create-category.usecase';
import { GetCategoriesUseCase } from 'src/applications/categories/get-categories.usecase';
import { DeleteCategoryUseCase } from 'src/applications/categories/delete-category.usecase';
import { JwtGuard } from 'src/infrastructures/security/jwt.guard';
import { Category } from 'src/domains/categories/entity/category.entity';
import request from 'supertest';
import { GlobalExceptionFilter } from 'src/interfaces/http/filters/http-exception.filter';

describe('CategoryController (HTTP)', () => {
  let app: INestApplication;

  const mockCreateCategoryUseCase = { execute: jest.fn() };
  const mockGetCategoriesUseCase = { execute: jest.fn() };
  const mockDeleteCategoryUseCase = { execute: jest.fn() };

  // Mock JwtGuard supaya tidak perlu kirim token asli di test
  const mockJwtGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
      const request = context.switchToHttp().getRequest();
      request.user = { userId: 'user-id-123' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CreateCategoryUseCase, useValue: mockCreateCategoryUseCase },
        { provide: GetCategoriesUseCase, useValue: mockGetCategoriesUseCase },
        { provide: DeleteCategoryUseCase, useValue: mockDeleteCategoryUseCase },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /categories', () => {
    it('should return 201 with created category', async () => {
      const mockCategory = new Category(
        'cat-id',
        'Makan',
        'user-id-123',
        new Date(),
      );
      mockCreateCategoryUseCase.execute.mockResolvedValue(mockCategory);

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'Makan' })
        .expect(201);

      expect(response.body.name).toBe('Makan');
      expect(mockCreateCategoryUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        'Makan',
      );
    });

    it('should return 400 when name is empty', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({ name: '' })
        .expect(400);

      expect(mockCreateCategoryUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('GET /categories', () => {
    it('should return 200 with list of categories', async () => {
      const mockCategories = [
        new Category('cat-1', 'Makan', 'user-id-123', new Date()),
        new Category('cat-2', 'Transport', 'user-id-123', new Date()),
      ];
      mockGetCategoriesUseCase.execute.mockResolvedValue(mockCategories);

      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockGetCategoriesUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
      );
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should return 200 on successful delete', async () => {
      mockDeleteCategoryUseCase.execute.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/categories/cat-id')
        .expect(200);

      expect(mockDeleteCategoryUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        'cat-id',
      );
    });

    it('should return 404 when category not found', async () => {
      mockDeleteCategoryUseCase.execute.mockRejectedValue(
        new NotFoundException(),
      );

      await request(app.getHttpServer())
        .delete('/categories/cat-id')
        .expect(404);
    });

    it('should return 403 when user is not the owner', async () => {
      mockDeleteCategoryUseCase.execute.mockRejectedValue(
        new ForbiddenException(),
      );

      await request(app.getHttpServer())
        .delete('/categories/cat-id')
        .expect(403);
    });
  });
});
