import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { TransactionRepository } from "src/domains/transactions/transaction.repository";
import { TRANSACTION_REPOSITORY } from "src/domains/transactions/transaction.token";

@Injectable()
export class DeleteTransactionUseCase {
    constructor(
        @Inject(TRANSACTION_REPOSITORY)
        private readonly transactionRepo: TransactionRepository
    ){}

    async execute(userId: string, transactionId: string) {
        const transaction = await this.transactionRepo.findById(transactionId)
        if (!transaction) throw new NotFoundException('Transaction not found')
        if (transaction.userId !== userId) throw new ForbiddenException()

        await this.transactionRepo.delete(transactionId)
    }
}