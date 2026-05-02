import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenUseCase } from '../use-case/refresh-token.usecase';
import { REFRESH_TOKEN_REPOSITORY } from 'src/domains/authentications/refresh-token.token';
import { JwtTokenService } from 'src/infrastructures/security/jwt.service';
import { UnauthorizedException } from '@nestjs/common';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockRefreshTokenRepo = {
    findValid: jest.fn(),
    revoke: jest.fn(),
    create: jest.fn(),
  };
  const mockJwt = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
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
        RefreshTokenUseCase,
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: mockRefreshTokenRepo },
        { provide: JwtTokenService, useValue: mockJwt },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    jest.clearAllMocks();
  });

  it('should revoke old token and return new accessToken and refreshToken', async () => {
    mockRefreshTokenRepo.findValid.mockResolvedValue(mockStoredToken);
    mockRefreshTokenRepo.revoke.mockResolvedValue(undefined);
    mockRefreshTokenRepo.create.mockResolvedValue(undefined);
    mockJwt.generateAccessToken.mockReturnValue('new_access_token');
    mockJwt.generateRefreshToken.mockReturnValue('new_refresh_token');

    const result = await useCase.execute('valid_refresh_token');

    expect(mockRefreshTokenRepo.findValid).toHaveBeenCalledWith(
      'valid_refresh_token',
    );
    expect(mockRefreshTokenRepo.revoke).toHaveBeenCalledWith(
      mockStoredToken.id,
    );
    expect(mockJwt.generateAccessToken).toHaveBeenCalledWith(
      mockStoredToken.userId,
    );
    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      mockStoredToken.userId,
      'new_refresh_token',
      expect.any(Date),
    );
    expect(result).toEqual({
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    });
  });

  it('should throw UnauthorizedException when token is invalid or already revoked', async () => {
    mockRefreshTokenRepo.findValid.mockResolvedValue(null);

    await expect(useCase.execute('invalid_token')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockRefreshTokenRepo.revoke).not.toHaveBeenCalled();
    expect(mockJwt.generateAccessToken).not.toHaveBeenCalled();
  });
});
