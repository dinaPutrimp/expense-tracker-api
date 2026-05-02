import { PasswordHasher } from 'src/domains/security/password-hasher';
import * as bcrypt from 'bcrypt';

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
