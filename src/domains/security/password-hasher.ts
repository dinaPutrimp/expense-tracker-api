export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
  hash(password: string): Promise<string>;
}
