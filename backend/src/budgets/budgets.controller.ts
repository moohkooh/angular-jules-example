import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Get()
  async findAll(@Request() req, @Query('year') year: number, @Query('month') month: number) {
    return this.budgetsService.findAll(req.user.userId, year, month);
  }

  @Post()
  async upsert(@Body() body: any) {
    return this.budgetsService.upsert(body.categoryId, body.year, body.month, body.amount);
  }
}
