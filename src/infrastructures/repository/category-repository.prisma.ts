import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/domains/categories/category.repository';
import { PrismaService } from '../database/prisma.service';
import { Category } from 'src/domains/categories/entity/category.entity';

@Injectable()
export class CategoryRepositoryPrisma implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string): Promise<Category> {
    const record = await this.prisma.category.create({
      data: { userId, name },
    });
    return new Category(
      record.id,
      record.name,
      record.userId,
      record.createdAt,
    );
  }

  async findAllByUserId(userId: string): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(
      (r) => new Category(r.id, r.name, r.userId, r.createdAt),
    );
  }

  async findById(id: string): Promise<Category | null> {
    const record = await this.prisma.category.findUnique({ where: { id } });
    if (!record) return null;
    return new Category(
      record.id,
      record.name,
      record.userId,
      record.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }
}
