import { Module } from '@nestjs/common';
import { AuthModule } from './infrastructures/modules/auth.module';
import { DatabaseModule } from './infrastructures/modules/database.module';
import { CategoryModule } from './infrastructures/modules/category.module';
import { TransactionModule } from './infrastructures/modules/transaction.module';

@Module({
  imports: [DatabaseModule, AuthModule, CategoryModule, TransactionModule],
})
export class AppModule {}
