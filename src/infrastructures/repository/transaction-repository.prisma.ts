import { Injectable } from '@nestjs/common';
import {
  FindAllOptions,
  MonthlyChart,
  TransactionRepository,
} from 'src/domains/transactions/transaction.repository';
import { PrismaService } from '../database/prisma.service';
import { Transaction } from 'src/domains/transactions/entity/transaction.entity';

@Injectable()
export class TransactionRepositoryPrisma implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    amount: number,
    type: 'INCOME' | 'EXPENSE',
    categoryId: string,
  ): Promise<Transaction> {
    const record = await this.prisma.transaction.create({
      data: { userId, amount, type, categoryId },
    });
    return new Transaction(
      record.id,
      record.userId,
      record.amount,
      record.type,
      record.categoryId,
      record.createdAt,
    );
  }
  async findAll(
    options: FindAllOptions,
  ): Promise<{ data: Transaction[]; total: number }> {
    const where = {
      userId: options.userId,
      ...(options.type && { type: options.type }),
      ...(options.categoryId && { categoryId: options.categoryId }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return {
      data: data.map(
        (record) =>
          new Transaction(
            record.id,
            record.userId,
            record.amount,
            record.type,
            record.categoryId,
            record.createdAt,
          ),
      ),
      total,
    };
  }

  async findById(id: string): Promise<Transaction | null> {
    const record = await this.prisma.transaction.findUnique({ where: { id } });
    if (!record) return null;
    return new Transaction(
      record.id,
      record.userId,
      record.amount,
      record.type,
      record.categoryId,
      record.createdAt,
    );
  }

  async update(
    id: string,
    amount: number,
    categoryId: string,
  ): Promise<Transaction> {
    const record = await this.prisma.transaction.update({
      where: { id },
      data: { amount, categoryId },
    });
    return new Transaction(
      record.id,
      record.userId,
      record.amount,
      record.type,
      record.categoryId,
      record.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } });
  }

  async findByMonth(
    userId: string,
    month: number,
    year: number,
  ): Promise<Transaction[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const records = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(
      (record) =>
        new Transaction(
          record.id,
          record.userId,
          record.amount,
          record.type,
          record.categoryId,
          record.createdAt,
        ),
    );
  }
  async getMonthlyChart(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthlyChart[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, createdAt: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const categoryIds = grouped.map((group) => group.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    return grouped.map((group) => ({
      categoryId: group.categoryId,
      categoryName:
        categories.find((category) => category.id === group.categoryId)?.name ??
        'Unknown',
      total: group._sum.amount ?? 0,
    }));
  }
}
