import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { BankAccount } from '../accounts/account.entity';
import { Category } from '../categories/category.entity';
import { parse } from 'csv-parse/sync';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async findAll(accountId: number): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { account: { id: accountId } },
      relations: ['category'],
      order: { bookingDate: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({ where: { id }, relations: ['category'] });
  }

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionsRepository.create(data);
    return this.transactionsRepository.save(transaction);
  }

  async update(id: number, data: Partial<Transaction>): Promise<Transaction | null> {
    await this.transactionsRepository.update(id, data);
    return this.findOne(id);
  }

  async bulkCreate(transactions: Partial<Transaction>[]): Promise<Transaction[]> {
    return this.transactionsRepository.save(transactions);
  }

  async parseSparkasseCsv(csvData: string): Promise<any[]> {
    const records = parse(csvData, {
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
      relax_column_count: true,
    });
    return records;
  }
}
