import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';
import { User } from '../users/user.entity';

@Entity('category_rules')
export class CategoryRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pattern: string; // Partner name or purpose part

  @ManyToOne(() => Category)
  category: Category;

  @ManyToOne(() => User)
  user: User;
}
