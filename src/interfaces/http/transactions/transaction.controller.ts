import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTransactionUseCase } from 'src/applications/transactions/use-case/create-transaction.usecase';
import { DeleteTransactionUseCase } from 'src/applications/transactions/use-case/delete-transaction.usecase';
import { GetMonthlyChartUseCase } from 'src/applications/transactions/use-case/get-monthly-chart.usecase';
import { GetMonthlyTransactionsUseCase } from 'src/applications/transactions/use-case/get-monthly-transactions.usecase';
import { GetTransactionsUseCase } from 'src/applications/transactions/use-case/get-transactions.usecase';
import { UpdateTransactionUseCase } from 'src/applications/transactions/use-case/update-transaction.usecase';
import { JwtGuard } from 'src/infrastructures/security/jwt.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  CreateTransactionDto,
  GetTransactionsQueryDto,
  MonthQueryDto,
  UpdateTransactionDto,
} from './transaction.dto';

@UseGuards(JwtGuard)
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly updateTransactionUseCase: UpdateTransactionUseCase,
    private readonly deleteTransactionUseCase: DeleteTransactionUseCase,
    private readonly getMonthlyTransactionUseCase: GetMonthlyTransactionsUseCase,
    private readonly getMonthlyChartUseCase: GetMonthlyChartUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.createTransactionUseCase.execute(
      user.userId,
      dto.amount,
      dto.type,
      dto.categoryId,
    );
  }

  @Get()
  getAll(
    @CurrentUser() user: { userId: string },
    @Query() query: GetTransactionsQueryDto,
  ) {
    return this.getTransactionsUseCase.execute(
      user.userId,
      query.page,
      query.limit,
      query.type,
      query.categoryId,
    );
  }

  @Get('monthly')
  getMonthly(
    @CurrentUser() user: { userId: string },
    @Query() query: MonthQueryDto,
  ) {
    return this.getMonthlyTransactionUseCase.execute(
      user.userId,
      query.month,
      query.year,
    );
  }

  @Get('chart')
  getChart(
    @CurrentUser() user: { userId: string },
    @Query() query: MonthQueryDto,
  ) {
    return this.getMonthlyChartUseCase.execute(
      user.userId,
      query.month,
      query.year,
    );
  }

  @Put(':id')
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.updateTransactionUseCase.execute(
      user.userId,
      id,
      dto.amount,
      dto.categoryId,
    );
  }

  @Delete(':id')
  delete(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.deleteTransactionUseCase.execute(user.userId, id);
  }
}
