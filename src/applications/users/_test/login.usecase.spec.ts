import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from '../use-case/login.usecase';
import { USER_REPOSITORY } from 'src/domains/users/user.token';
import { REFRESH_TOKEN_REPOSITORY } from 'src/domains/authentications/refresh-token.token';
import { PASSWORD_HASHER } from 'src/domains/security/password-hasher.token';
import { JwtTokenService } from 'src/infrastructures/security/jwt.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const mockUserRepo = { findByEmail: jest.fn() };
  const mockRefreshTokenRepo = { create: jest.fn() };
  const mockPasswordHasher = { compare: jest.fn() };
  const mockJwt = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: mockRefreshTokenRepo },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: JwtTokenService, useValue: mockJwt },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  it('should return accessToken and refreshToken on valid credentials', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockJwt.generateAccessToken.mockReturnValue('access_token');
    mockJwt.generateRefreshToken.mockReturnValue('refresh_token');
    mockRefreshTokenRepo.create.mockResolvedValue(undefined);

    const result = await useCase.execute('test@example.com', 'secret123');

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
      'secret123',
      mockUser.passwordHash,
    );
    expect(mockJwt.generateAccessToken).toHaveBeenCalledWith(mockUser.id);
    expect(mockRefreshTokenRepo.create).toHaveBeenCalledWith(
      mockUser.id,
      'refresh_token',
      expect.any(Date),
    );
    expect(result).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute('notfound@example.com', 'secret123'),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockJwt.generateAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('test@example.com', 'wrong_password'),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockJwt.generateAccessToken).not.toHaveBeenCalled();
    expect(mockRefreshTokenRepo.create).not.toHaveBeenCalled();
  });
});
