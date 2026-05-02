import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UserRepository } from 'src/domains/users/user.repository';
import { User } from 'src/domains/users/entity/user.entity';

@Injectable()
export class UserRepositoryPrisma implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;

    return new User(record.id, record.email, record.fullName, record.password);
  }

  async findByEmail(email: string) {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;

    return new User(record.id, record.email, record.fullName, record.password);
  }

  async create(
    email: string,
    fullName: string,
    password: string,
  ): Promise<User> {
    const record = await this.prisma.user.create({
      data: { email, fullName, password },
    });

    return new User(record.id, record.email, record.fullName, record.password);
  }
}
