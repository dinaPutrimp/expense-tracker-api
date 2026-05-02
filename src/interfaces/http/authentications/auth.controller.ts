import { Body, Controller, Post } from '@nestjs/common';
import { RefreshTokenUseCase } from 'src/applications/authentications/use-case/refresh-token.usecase';
import { LoginUseCase } from 'src/applications/users/use-case/login.usecase';
import { LoginDto } from './login.dto';
import { LogoutUseCase } from 'src/applications/users/use-case/logout.usecase';
import { RegisterUseCase } from 'src/applications/users/use-case/register.usecase';
import { RegisterDto } from './register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto.email, dto.fullName, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.refreshTokenUseCase.execute(token);
  }

  @Post('logout')
  logout(@Body('refreshToken') token: string) {
    return this.logoutUseCase.execute(token);
  }
}
