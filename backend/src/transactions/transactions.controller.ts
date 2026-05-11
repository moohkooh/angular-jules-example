import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccountsService } from '../accounts/accounts.service';
import { CategoriesService } from '../categories/categories.service';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
    private categoriesService: CategoriesService,
  ) {}

  @Get('account/:accountId')
  async findAll(@Param('accountId') accountId: number) {
    return this.transactionsService.findAll(accountId);
  }

  @Post('manual/:accountId')
  async createManual(@Param('accountId') accountId: number, @Body() body: any) {
    return this.transactionsService.create({
      ...body,
      account: { id: accountId },
      category: body.categoryId ? { id: body.categoryId } : null,
      bookingDate: new Date(body.bookingDate),
      valueDate: body.valueDate ? new Date(body.valueDate) : new Date(body.bookingDate)
    });
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    const updateData: any = { ...body };
    if (body.categoryId !== undefined) {
      updateData.category = body.categoryId ? { id: body.categoryId } : null;
      delete updateData.categoryId;
    }
    return this.transactionsService.update(id, updateData);
  }

  @Post('import/:accountId')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@Param('accountId') accountId: number, @UploadedFile() file: any, @Request() req) {
    const csvData = file.buffer.toString('latin1');
    const records = await this.transactionsService.parseSparkasseCsv(csvData);
    const rules = await this.categoriesService.findRules(req.user.userId);

    const transactionsToProcess = records.map(record => {
      const amount = parseFloat(record['Betrag'].replace(',', '.'));
      const partnerName = record['Beguenstigter/Zahlungspflichtiger'];
      const purpose = record['Verwendungszweck'];

      let categoryId: number | null = null;
      let isFixedCost = false;

      const matchingRule = rules.find(rule =>
        (partnerName && partnerName.toLowerCase().includes(rule.pattern.toLowerCase())) ||
        (purpose && purpose.toLowerCase().includes(rule.pattern.toLowerCase()))
      );

      if (matchingRule) {
        categoryId = matchingRule.category.id;
        isFixedCost = matchingRule.category.isFixedCost;
      }

      return {
        bookingDate: this.parseDate(record['Buchungstag']),
        valueDate: this.parseDate(record['Valutadatum']),
        bookingText: record['Buchungstext'],
        purpose: purpose,
        partnerName: partnerName,
        partnerIban: record['Kontonummer/IBAN'],
        amount: amount,
        currency: record['Waehrung'],
        categoryId: categoryId,
        isFixedCost: isFixedCost,
        externalId: `${record['Buchungstag']}-${record['Betrag']}-${record['Verwendungszweck']}-${record['Kontonummer/IBAN']}`.substring(0, 255)
      };
    });

    return transactionsToProcess;
  }

  @Post('confirm-import/:accountId')
  async confirmImport(@Param('accountId') accountId: number, @Body() body: any) {
    const { transactions } = body;

    const processed = transactions.map(t => ({
      ...t,
      account: { id: accountId },
      category: t.categoryId ? { id: t.categoryId } : null
    }));

    return this.transactionsService.bulkCreate(processed);
  }

  private parseDate(dateStr: string): Date {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      let year = parseInt(parts[2]);
      if (year < 100) year += 2000;
      return new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
  }
}
