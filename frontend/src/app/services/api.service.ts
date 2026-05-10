import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Accounts
  getAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/accounts`);
  }

  createAccount(name: string, iban: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/accounts`, { name, iban });
  }

  // Categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`);
  }

  createCategory(name: string, isFixedCost: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, { name, isFixedCost });
  }

  getRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/rules`);
  }

  createRule(categoryId: number, pattern: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories/rules`, { categoryId, pattern });
  }

  createRulesBulk(rules: { categoryId: number, pattern: string }[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories/rules/bulk`, rules);
  }

  // Transactions
  getTransactions(accountId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/transactions/account/${accountId}`);
  }

  importCsv(accountId: number, file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any[]>(`${this.baseUrl}/transactions/import/${accountId}`, formData);
  }

  confirmImport(accountId: number, transactions: any[], newRules: any[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/transactions/confirm-import/${accountId}`, { transactions, newRules });
  }

  // Budgets
  getBudgets(year: number, month: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/budgets?year=${year}&month=${month}`);
  }

  upsertBudget(categoryId: number, year: number, month: number, amount: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/budgets`, { categoryId, year, month, amount });
  }
}
