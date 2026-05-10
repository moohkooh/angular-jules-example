import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './category.entity';
import { CategoryRule } from './category-rule.entity';
import { User } from '../users/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(CategoryRule)
    private categoryRulesRepository: Repository<CategoryRule>,
  ) {}

  async findAll(userId: number): Promise<Category[]> {
    return this.categoriesRepository.find({ where: { user: { id: userId } } });
  }

  async create(userId: number, name: string, isFixedCost: boolean): Promise<Category> {
    const category = this.categoriesRepository.create({ name, isFixedCost, user: { id: userId } as User });
    return this.categoriesRepository.save(category);
  }

  async findRules(userId: number): Promise<CategoryRule[]> {
    return this.categoryRulesRepository.find({
      where: { user: { id: userId } },
      relations: ['category']
    });
  }

  async createRule(userId: number, categoryId: number, pattern: string): Promise<CategoryRule> {
    // Prevent duplicate rules for the same pattern and user
    let rule = await this.categoryRulesRepository.findOne({ where: { user: { id: userId }, pattern } });
    if (rule) {
      rule.category = { id: categoryId } as Category;
    } else {
      rule = this.categoryRulesRepository.create({
        pattern,
        category: { id: categoryId } as Category,
        user: { id: userId } as User
      });
    }
    return this.categoryRulesRepository.save(rule);
  }

  async createRulesBulk(userId: number, rules: { categoryId: number, pattern: string }[]): Promise<CategoryRule[]> {
    const processedRules: CategoryRule[] = [];
    for (const r of rules) {
      const rule = await this.createRule(userId, r.categoryId, r.pattern);
      processedRules.push(rule);
    }
    return processedRules;
  }
}
