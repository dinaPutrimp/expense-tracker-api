import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PASSWORD_HASHER } from 'src/domains/security/password-hasher.token';
import type { UserRepository } from 'src/domains/users/user.repository';
import { USER_REPOSITORY } from 'src/domains/users/user.token';
import type { BcryptPasswordHasher } from 'src/infrastructures/security/bcrypt-password-hasher';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: BcryptPasswordHasher,
  ) {}

  async execute(email: string, fullName: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);

    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await this.passwordHasher.hash(password);
    await this.userRepo.create(email, fullName, hashedPassword);
  }
}
