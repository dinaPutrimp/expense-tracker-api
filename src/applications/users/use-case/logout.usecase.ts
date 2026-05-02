import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { RefreshTokenRepository } from 'src/domains/authentications/refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from 'src/domains/authentications/refresh-token.token';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshToken: RefreshTokenRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const stored = await this.refreshToken.findValid(token);
    if (!stored) throw new NotFoundException();

    await this.refreshToken.revoke(stored.id);
  }
}
