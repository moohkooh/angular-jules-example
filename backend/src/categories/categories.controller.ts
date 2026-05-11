import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.categoriesService.create(req.user.userId, body.name, body.isFixedCost);
  }

  @Get('rules')
  async findRules(@Request() req) {
    return this.categoriesService.findRules(req.user.userId);
  }

  @Post('rules')
  async createRule(@Request() req, @Body() body: any) {
    return this.categoriesService.createRule(req.user.userId, body.categoryId, body.pattern);
  }

  @Post('rules/bulk')
  async createRulesBulk(@Request() req, @Body() rules: any[]) {
    return this.categoriesService.createRulesBulk(req.user.userId, rules);
  }
}
