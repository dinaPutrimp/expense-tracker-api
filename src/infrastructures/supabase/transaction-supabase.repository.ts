import { Injectable } from '@nestjs/common';
import { Transaction } from 'src/domains/transactions/entity/transaction.entity';
import { TransactionRepository } from 'src/domains/transactions/transaction.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { InvariantError } from 'src/commons/exceptions/invariant.error';
import { NotFoundError } from 'src/commons/exceptions/not-found.error';

@Injectable()
export class TransactionRepositorySupabase implements TransactionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(transaction: Transaction): Promise<void> {
    const { id, userId, amount, type, categoryId, walletId, date, note } =
      transaction;
    const { error } = await this.supabase
      .from('transactions')
      .insert({
        id,
        user_id: userId,
        wallet_id: walletId,
        category_id: categoryId,
        amount,
        type,
        date,
        note,
      });

    if (error) {
      throw new InvariantError(
        `Failed to create transaction: ${error.message}`,
      );
    }
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundError(error.message);
    }

    return data;
  }
}
