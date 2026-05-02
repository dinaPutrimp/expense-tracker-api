import { Test, TestingModule } from '@nestjs/testing';
import { GetMonthlyChartUseCase } from '../use-case/get-monthly-chart.usecase';
import { TRANSACTION_REPOSITORY } from 'src/domains/transactions/transaction.token';

describe('GetMonthlyChartUseCase', () => {
  let useCase: GetMonthlyChartUseCase;

  const mockTransactionRepo = { getMonthlyChart: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMonthlyChartUseCase,
        { provide: TRANSACTION_REPOSITORY, useValue: mockTransactionRepo },
      ],
    }).compile();

    useCase = module.get<GetMonthlyChartUseCase>(GetMonthlyChartUseCase);
    jest.clearAllMocks();
  });

  it('should return chart data grouped by category', async () => {
    const mockChart = [
      { categoryId: 'cat-1', categoryName: 'Makan', total: 150000 },
      { categoryId: 'cat-2', categoryName: 'Transport', total: 75000 },
    ];
    mockTransactionRepo.getMonthlyChart.mockResolvedValue(mockChart);

    const result = await useCase.execute('user-id', 5, 2026);

    expect(mockTransactionRepo.getMonthlyChart).toHaveBeenCalledWith(
      'user-id',
      5,
      2026,
    );
    expect(result).toEqual(mockChart);
  });

  it('should return empty array when no transactions in that month', async () => {
    mockTransactionRepo.getMonthlyChart.mockResolvedValue([]);

    const result = await useCase.execute('user-id', 5, 2026);

    expect(result).toEqual([]);
  });
});
