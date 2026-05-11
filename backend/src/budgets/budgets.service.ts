import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  async findAll(userId: number, year: number, month: number): Promise<Budget[]> {
    return this.budgetsRepository.find({
      where: { year, month, category: { user: { id: userId } } },
      relations: ['category']
    });
  }

  async upsert(categoryId: number, year: number, month: number, amount: number): Promise<Budget> {
    let budget = await this.budgetsRepository.findOne({
      where: { category: { id: categoryId }, year, month }
    });

    if (budget) {
      budget.amount = amount;
    } else {
      budget = this.budgetsRepository.create({
        category: { id: categoryId },
        year,
        month,
        amount
      });
    }
    return this.budgetsRepository.save(budget);
  }
}
