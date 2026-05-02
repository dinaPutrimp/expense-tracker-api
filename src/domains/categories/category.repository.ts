import { Category } from './entity/category.entity';

export interface CategoryRepository {
  create(userId: string, name: string): Promise<Category>;
  findAllByUserId(userId: string): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  delete(id: string): Promise<void>;
}
