import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY } from 'src/domains/authentications/refresh-token.token';
import { LogoutUseCase } from '../use-case/logout.usecase';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  const mockRefreshTokenRepo = {
    findValid: jest.fn(),
    revoke: jest.fn(),
  };

  const mockStoredToken = {
    id: 'token-id-123',
    userId: 'user-id-123',
    token: 'valid_refresh_token',
    revoked: false,
    expiresAt: new Date(Date.now() + 10000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: mockRefreshTokenRepo },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    jest.clearAllMocks();
  });

  it('should revoke the token on valid logout', async () => {
    mockRefreshTokenRepo.findValid.mockResolvedValue(mockStoredToken);
    mockRefreshTokenRepo.revoke.mockResolvedValue(undefined);

    await useCase.execute('valid_refresh_token');

    expect(mockRefreshTokenRepo.findValid).toHaveBeenCalledWith(
      'valid_refresh_token',
    );
    expect(mockRefreshTokenRepo.revoke).toHaveBeenCalledWith(
      mockStoredToken.id,
    );
  });

  it('should throw NotFoundException when token is not found', async () => {
    mockRefreshTokenRepo.findValid.mockResolvedValue(null);

    await expect(useCase.execute('invalid_token')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockRefreshTokenRepo.revoke).not.toHaveBeenCalled();
  });
});
