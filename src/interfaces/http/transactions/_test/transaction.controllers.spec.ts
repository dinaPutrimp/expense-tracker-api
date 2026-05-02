import {
  INestApplication,
  ValidationPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../transaction.controller';
import { CreateTransactionUseCase } from 'src/applications/transactions/use-case/create-transaction.usecase';
import { GetTransactionsUseCase } from 'src/applications/transactions/use-case/get-transactions.usecase';
import { UpdateTransactionUseCase } from 'src/applications/transactions/use-case/update-transaction.usecase';
import { DeleteTransactionUseCase } from 'src/applications/transactions/use-case/delete-transaction.usecase';
import { GetMonthlyTransactionsUseCase } from 'src/applications/transactions/use-case/get-monthly-transactions.usecase';
import { GetMonthlyChartUseCase } from 'src/applications/transactions/use-case/get-monthly-chart.usecase';
import { JwtGuard } from 'src/infrastructures/security/jwt.guard';
import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import request from 'supertest';
import { GlobalExceptionFilter } from 'src/interfaces/http/filters/http-exception.filter';

describe('TransactionController [HTTP]', () => {
  let app: INestApplication;

  const mockCreateTransactionUseCase = { execute: jest.fn() };
  const mockGetTransactionsUseCase = { execute: jest.fn() };
  const mockUpdateTransactionUseCase = { execute: jest.fn() };
  const mockDeleteTransactionUseCase = { execute: jest.fn() };
  const mockGetMonthlyTransactionsUseCase = { execute: jest.fn() };
  const mockGetMonthlyChartUseCase = { execute: jest.fn() };

  const mockJwtGuard = {
    canActivate: jest.fn().mockImplementation((context) => {
      const request = context.switchToHttp().getRequest();
      request.user = { userId: 'user-id-123' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: CreateTransactionUseCase,
          useValue: mockCreateTransactionUseCase,
        },
        {
          provide: GetTransactionsUseCase,
          useValue: mockGetTransactionsUseCase,
        },
        {
          provide: UpdateTransactionUseCase,
          useValue: mockUpdateTransactionUseCase,
        },
        {
          provide: DeleteTransactionUseCase,
          useValue: mockDeleteTransactionUseCase,
        },
        {
          provide: GetMonthlyTransactionsUseCase,
          useValue: mockGetMonthlyTransactionsUseCase,
        },
        {
          provide: GetMonthlyChartUseCase,
          useValue: mockGetMonthlyChartUseCase,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should return 201 with created transaction', async () => {
      const mockTransaction = new Transaction(
        'trx-id',
        'user-id-123',
        20000,
        'EXPENSE',
        'cat-id',
        new Date(),
      );
      mockCreateTransactionUseCase.execute.mockResolvedValue(mockTransaction);

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 20000, type: 'EXPENSE', categoryId: 'cat-id' })
        .expect(201);

      expect(response.body.amount).toBe(20000);
      expect(mockCreateTransactionUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        20000,
        'EXPENSE',
        'cat-id',
      );
    });

    it('should return 400 when amount is missing', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ type: 'EXPENSE', categoryId: 'cat-id' })
        .expect(400);

      expect(mockCreateTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when type is invalid', async () => {
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 20000, type: 'INVALID', categoryId: 'cat-id' })
        .expect(400);

      expect(mockCreateTransactionUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('GET /transactions', () => {
    it('should return 200 with list of transactions and pagination', async () => {
      const mockTransactions = [
        new Transaction(
          'trx-1',
          'user-id-123',
          20000,
          'EXPENSE',
          'cat-id',
          new Date(),
        ),
        new Transaction(
          'trx-2',
          'user-id-123',
          10000,
          'EXPENSE',
          'cat-id',
          new Date(),
        ),
      ];
      mockGetTransactionsUseCase.execute.mockResolvedValue({
        data: mockTransactions,
        total: 2,
      });

      const response = await request(app.getHttpServer())
        .get('/transactions?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(mockGetTransactionsUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        1,
        10,
        undefined,
        undefined,
      );
    });
  });

  describe('GET /transactions/monthly', () => {
    it('should return 200 with list of transactions for that month', async () => {
      const mockTransactions = [
        new Transaction(
          'trx-1',
          'user-id-123',
          20000,
          'EXPENSE',
          'cat-id',
          new Date(),
        ),
        new Transaction(
          'trx-2',
          'user-id-123',
          10000,
          'EXPENSE',
          'cat-id',
          new Date(),
        ),
      ];
      mockGetMonthlyTransactionsUseCase.execute.mockResolvedValue(
        mockTransactions,
      );

      const response = await request(app.getHttpServer())
        .get('/transactions/monthly?month=5&year=2026')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(mockGetMonthlyTransactionsUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        5,
        2026,
      );
    });
  });

  describe('GET /transactions/chart', () => {
    it('should return 200 with chart data grouped by category', async () => {
      const mockChart = [
        { categoryId: 'cat-1', categoryName: 'Makan', total: 150000 },
      ];
      mockGetMonthlyChartUseCase.execute.mockResolvedValue(mockChart);

      const response = await request(app.getHttpServer())
        .get('/transactions/chart?month=5&year=2026')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(mockGetMonthlyChartUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        5,
        2026,
      );
    });
  });

  describe('PUT /transactions/:id', () => {
    it('should return 200 with updated transaction', async () => {
      const updated = new Transaction(
        'trx-id',
        'user-id-123',
        75000,
        'EXPENSE',
        'cat-id',
        new Date(),
      );
      mockUpdateTransactionUseCase.execute.mockResolvedValue(updated);

      const response = await request(app.getHttpServer())
        .put('/transactions/trx-id')
        .send({ amount: 75000, categoryId: 'cat-id' })
        .expect(200);

      expect(response.body.amount).toBe(75000);
      expect(mockUpdateTransactionUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        'trx-id',
        75000,
        'cat-id',
      );
    });

    it('should return 400 when amount is missing', async () => {
      await request(app.getHttpServer())
        .put('/transactions/trx-id')
        .send({ categoryId: 'cat-id' })
        .expect(400);

      expect(mockUpdateTransactionUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 404 when transaction not found', async () => {
      mockUpdateTransactionUseCase.execute.mockRejectedValue(
        new NotFoundException(),
      );

      await request(app.getHttpServer())
        .put('/transactions/trx-id')
        .send({ amount: 75000, categoryId: 'cat-id' })
        .expect(404);
    });

    it('should return 403 when transaction belongs to another user', async () => {
      mockUpdateTransactionUseCase.execute.mockRejectedValue(
        new ForbiddenException(),
      );

      await request(app.getHttpServer())
        .put('/transactions/trx-id')
        .send({ amount: 75000, categoryId: 'cat-id' })
        .expect(403);
    });
  });

  describe('DELETE /transactions/:id', () => {
    it('should return 200 on successful delete', async () => {
      mockDeleteTransactionUseCase.execute.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/transactions/trx-id')
        .expect(200);

      expect(mockDeleteTransactionUseCase.execute).toHaveBeenCalledWith(
        'user-id-123',
        'trx-id',
      );
    });

    it('should return 404 when transaction not found', async () => {
      mockDeleteTransactionUseCase.execute.mockRejectedValue(
        new NotFoundException(),
      );

      await request(app.getHttpServer())
        .delete('/transactions/trx-id')
        .expect(404);
    });

    it('should return 403 when transaction belongs to another user', async () => {
      mockDeleteTransactionUseCase.execute.mockRejectedValue(
        new ForbiddenException(),
      );

      await request(app.getHttpServer())
        .delete('/transactions/trx-id')
        .expect(403);
    });
  });
});
