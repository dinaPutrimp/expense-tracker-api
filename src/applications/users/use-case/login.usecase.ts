import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtTokenService } from "src/infrastructures/security/jwt.service";
import { USER_REPOSITORY } from "src/domains/users/user.token";
import { BcryptPasswordHasher } from "src/infrastructures/security/bcrypt-password-hasher";
import { REFRESH_TOKEN_REPOSITORY } from "src/domains/authentications/refresh-token.token";
import { PASSWORD_HASHER } from "src/domains/security/password-hasher.token";
import type { UserRepository } from "src/domains/users/user.repository";
import type { RefreshTokenRepository } from "src/domains/authentications/refresh-token.repository";

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class LoginUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly user: UserRepository,
        
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshRepo: RefreshTokenRepository,
        
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: BcryptPasswordHasher,

        private readonly jwt: JwtTokenService
    ) { }

    async execute(email: string, password: string) {
        const user = await this.user.findByEmail(email)
        if (!user) throw new UnauthorizedException()

        const valid = await this.passwordHasher.compare(password, user.passwordHash)
        if (!valid) throw new UnauthorizedException()

        const accessToken = this.jwt.generateAccessToken(user.id)
        const refreshToken = this.jwt.generateRefreshToken()

        await this.refreshRepo.create(user.id, refreshToken, new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN))

        return { accessToken, refreshToken }
    }
}