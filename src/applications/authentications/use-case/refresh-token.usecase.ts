import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { RefreshTokenRepository } from "src/domains/authentications/refresh-token.repository";
import { REFRESH_TOKEN_REPOSITORY } from "src/domains/authentications/refresh-token.token";
import { JwtTokenService } from "src/infrastructures/security/jwt.service";

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private refreshRepo: RefreshTokenRepository,
        private jwt: JwtTokenService,
    ) { }

    async execute(token: string) {
        const storedToken = await this.refreshRepo.findValid(token)
        if (!storedToken) throw new UnauthorizedException()

        await this.refreshRepo.revoke(storedToken.id)

        const newAccessToken = this.jwt.generateAccessToken(storedToken.userId)
        const newRefreshToken = this.jwt.generateRefreshToken()

        await this.refreshRepo.create(storedToken.userId, newRefreshToken, new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN))

        return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    }
}