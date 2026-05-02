import { User } from './entity/user.entity';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(email: string, fullName: string, password: string): Promise<User>;
}
