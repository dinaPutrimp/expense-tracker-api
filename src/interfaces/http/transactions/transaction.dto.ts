import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsEnum(['INCOME', 'EXPENSE'])
  type: 'INCOME' | 'EXPENSE';

  @IsString()
  categoryId: string;
}

export class UpdateTransactionDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsString()
  categoryId: string;
}

export class GetTransactionsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;

  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: 'INCOME' | 'EXPENSE';

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class MonthQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  month: number;

  @IsInt()
  @Min(2000)
  @Type(() => Number)
  year: number;
}
