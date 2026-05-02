import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/domains/users/user.token';
import { AuthController } from 'src/interfaces/http/authentications/auth.controller';
import { UserRepositoryPrisma } from '../repository/user-repository.prisma';
import { REFRESH_TOKEN_REPOSITORY } from 'src/domains/authentications/refresh-token.token';
import { RefreshTokenRepositoryPrisma } from '../repository/refresh-token-repository.prisma';
import { PASSWORD_HASHER } from 'src/domains/security/password-hasher.token';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher';
import { LoginUseCase } from 'src/applications/users/use-case/login.usecase';
import { RefreshTokenUseCase } from 'src/applications/authentications/use-case/refresh-token.usecase';
import { JwtTokenService } from '../security/jwt.service';
import { LogoutUseCase } from 'src/applications/users/use-case/logout.usecase';
import { RegisterUseCase } from 'src/applications/users/use-case/register.usecase';

@Module({
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    RefreshTokenUseCase,
    JwtTokenService,
    LogoutUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryPrisma,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepositoryPrisma,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
  ],
})
export class AuthModule {}
