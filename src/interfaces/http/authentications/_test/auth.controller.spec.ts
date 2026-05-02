import {
  INestApplication,
  ValidationPipe,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { LoginUseCase } from 'src/applications/users/use-case/login.usecase';
import { RegisterUseCase } from 'src/applications/users/use-case/register.usecase';
import { RefreshTokenUseCase } from 'src/applications/authentications/use-case/refresh-token.usecase';
import { LogoutUseCase } from 'src/applications/users/use-case/logout.usecase';
import { AuthController } from '../auth.controller';
import { GlobalExceptionFilter } from 'src/interfaces/http/filters/http-exception.filter';

describe('AuthController (HTTP)', () => {
  let app: INestApplication;

  const mockLoginUseCase = { execute: jest.fn() };
  const mockRegisterUseCase = { execute: jest.fn() };
  const mockRefreshTokenUseCase = { execute: jest.fn() };
  const mockLogoutUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: RefreshTokenUseCase, useValue: mockRefreshTokenUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return 201 on successful register', async () => {
      mockRegisterUseCase.execute.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          fullName: 'John Doe',
          password: 'secret123',
        })
        .expect(201);

      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
        'John Doe',
        'secret123',
      );
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'bukan-email',
          fullName: 'John Doe',
          password: 'secret123',
        })
        .expect(400);

      expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when fullName is empty', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          fullName: '',
          password: 'secret123',
        })
        .expect(400);

      expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          fullName: 'John Doe',
          password: '123',
        })
        .expect(400);

      expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 409 when email already registered', async () => {
      mockRegisterUseCase.execute.mockRejectedValue(new ConflictException());

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          fullName: 'John Doe',
          password: 'secret123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 201 with tokens on valid credentials', async () => {
      const mockTokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      mockLoginUseCase.execute.mockResolvedValue(mockTokens);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'secret123' })
        .expect(201);

      expect(response.body).toEqual(mockTokens);
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(
        'test@example.com',
        'secret123',
      );
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bukan-email', password: 'secret123' })
        .expect(400);

      expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: '123' })
        .expect(400);

      expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 401 when credentials are wrong', async () => {
      mockLoginUseCase.execute.mockRejectedValue(new UnauthorizedException());

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong_pass' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 201 with new tokens on valid refresh token', async () => {
      const mockTokens = {
        accessToken: 'new_access',
        refreshToken: 'new_refresh',
      };
      mockRefreshTokenUseCase.execute.mockResolvedValue(mockTokens);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' })
        .expect(201);

      expect(response.body).toEqual(mockTokens);
      expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith(
        'valid_refresh_token',
      );
    });

    it('should return 401 when refresh token is invalid', async () => {
      mockRefreshTokenUseCase.execute.mockRejectedValue(
        new UnauthorizedException(),
      );

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return 201 on successful logout', async () => {
      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: 'valid_refresh_token' })
        .expect(201);

      expect(mockLogoutUseCase.execute).toHaveBeenCalledWith(
        'valid_refresh_token',
      );
    });

    it('should return 404 when token is not found', async () => {
      mockLogoutUseCase.execute.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: 'invalid_token' })
        .expect(404);
    });
  });
});
