import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.accountsService.create(req.user.userId, body.name, body.iban);
  }
}
