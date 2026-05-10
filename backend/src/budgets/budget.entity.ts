import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @ManyToOne(() => Category)
  category: Category;
}
