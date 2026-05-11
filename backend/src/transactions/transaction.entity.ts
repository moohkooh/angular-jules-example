import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BankAccount } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bookingDate: Date;

  @Column()
  valueDate: Date;

  @Column({ nullable: true })
  bookingText: string;

  @Column({ nullable: true })
  purpose: string;

  @Column({ nullable: true })
  partnerName: string;

  @Column({ nullable: true })
  partnerIban: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ default: false })
  isFixedCost: boolean;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => BankAccount, (account) => account.transactions)
  account: BankAccount;

  @ManyToOne(() => Category, { nullable: true })
  category: Category;

  @Column({ unique: true, nullable: true })
  externalId: string; // To avoid duplicates on re-import
}
