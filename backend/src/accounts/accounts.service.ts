import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './account.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private accountsRepository: Repository<BankAccount>,
  ) {}

  async findAll(userId: number): Promise<BankAccount[]> {
    return this.accountsRepository.find({ where: { user: { id: userId } } });
  }

  async create(userId: number, name: string, iban: string): Promise<BankAccount> {
    const account = this.accountsRepository.create({ name, iban, user: { id: userId } as User });
    return this.accountsRepository.save(account);
  }

  async findByIban(iban: string): Promise<BankAccount | null> {
    return this.accountsRepository.findOne({ where: { iban } });
  }
}
