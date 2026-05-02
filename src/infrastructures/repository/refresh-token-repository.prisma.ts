import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { RefreshTokenRepository } from "src/domains/authentications/refresh-token.repository";

@Injectable()
export class RefreshTokenRepositoryPrisma implements RefreshTokenRepository {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, token: string, expiresAt: Date) {
        await this.prisma.refreshToken.create({ data: { userId, token, expiresAt } })
    }

    findValid(token: string) {
        return this.prisma.refreshToken.findFirst({
            where: {
                token, revoked: false, expiresAt: { gt: new Date() }
            }
        })
    }

    async revoke(id: string) {
        await this.prisma.refreshToken.update({
            where: { id }, data: { revoked: true }
        })
    }
}