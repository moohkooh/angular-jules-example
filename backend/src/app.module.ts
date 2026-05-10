import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { BankAccount } from './accounts/account.entity';
import { Category } from './categories/category.entity';
import { Transaction } from './transactions/transaction.entity';
import { Budget } from './budgets/budget.entity';
import { CategoryRule } from './categories/category-rule.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'user'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'bankapp'),
        entities: [User, BankAccount, Category, Transaction, Budget, CategoryRule],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
    // For SQLite testing, you can swap the above with:
    /*
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, BankAccount, Category, Transaction, Budget, CategoryRule],
      synchronize: true,
    }),
    */
    AuthModule,
    UsersModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
