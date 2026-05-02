import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { USER_REPOSITORY } from 'src/domains/users/user.token';
import { PASSWORD_HASHER } from 'src/domains/security/password-hasher.token';
import { User } from 'src/domains/users/entity/user.entity';
import { RegisterUseCase } from '../use-case/register.usecase';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  const mockUserRepo = { findByEmail: jest.fn(), create: jest.fn() };
  const mockPasswordHasher = { hash: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepo },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    jest.clearAllMocks();
  });

  it('should register user successfully', async () => {
    const mockUser = new User(
      'user-id-123',
      'test@example.com',
      'John Doe',
      'hashed_password',
    );
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue('hashed_password');
    mockUserRepo.create.mockResolvedValue(mockUser);

    await useCase.execute('test@example.com', 'John Doe', 'secret123');

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith('secret123');
    expect(mockUserRepo.create).toHaveBeenCalledWith(
      'test@example.com',
      'John Doe',
      'hashed_password',
    );
  });

  it('should throw ConflictException when email already registered', async () => {
    const mockUser = new User(
      'user-id-123',
      'test@example.com',
      'John Doe',
      'hashed_password',
    );
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute('test@example.com', 'John Doe', 'secret123'),
    ).rejects.toThrow(ConflictException);

    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepo.create).not.toHaveBeenCalled();
  });
});
