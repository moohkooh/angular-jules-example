import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TransactionDialogComponent } from '../../components/transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    RouterModule,
    BaseChartDirective
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Bank Manager Dashboard</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/accounts">Accounts</button>
      <button mat-button routerLink="/categories">Categories</button>
      <button mat-icon-button (click)="logout()">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <div class="container">
      <div class="controls">
        <mat-form-field appearance="outline">
          <mat-label>Select Account</mat-label>
          <mat-select [(ngModel)]="selectedAccountId" (selectionChange)="loadData()">
            <mat-option *ngFor="let acc of accounts" [value]="acc.id">{{acc.name}} ({{acc.iban}})</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Month</mat-label>
          <mat-select [(ngModel)]="selectedMonth" (selectionChange)="loadData()">
            <mat-option *ngFor="let m of months; let i = index" [value]="i+1">{{m}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Year</mat-label>
          <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadData()">
            <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="accent" *ngIf="selectedAccountId" [routerLink]="['/import', selectedAccountId]">
            <mat-icon>upload</mat-icon> Import Sparkasse CSV
          </button>
          <button mat-raised-button color="primary" *ngIf="selectedAccountId" (click)="addManualTransaction()">
            <mat-icon>add</mat-icon> Add Transaction
          </button>
        </div>
      </div>

      <div class="stats" *ngIf="selectedAccountId && categories.length > 0">
        <mat-card>
          <mat-card-header><mat-card-title>Spending vs Budget</mat-card-title></mat-card-header>
          <mat-card-content>
            <div style="display: block; height: 300px;">
              <canvas baseChart
                [data]="barChartData"
                [options]="barChartOptions"
                [type]="'bar'">
              </canvas>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="transaction-list" *ngIf="selectedAccountId">
          <h3>Transactions for {{months[selectedMonth-1]}} {{selectedYear}}</h3>
          <table class="styled-table">
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Partner</th>
                      <th>Purpose / Comment</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  <tr *ngFor="let t of transactions">
                      <td>{{t.bookingDate | date}}</td>
                      <td>{{t.partnerName}}</td>
                      <td>
                        <strong>{{t.purpose}}</strong>
                        <div *ngIf="t.comment" class="comment">
                           <mat-icon class="comment-icon">notes</mat-icon> {{t.comment}}
                        </div>
                      </td>
                      <td>
                        <span [class.fixed-badge]="t.isFixedCost" [matTooltip]="t.isFixedCost ? 'Fixed Cost' : ''">
                          {{t.category?.name || 'Uncategorized'}}
                        </span>
                      </td>
                      <td [class.negative]="t.amount < 0" [class.positive]="t.amount > 0">
                        {{t.amount | currency:'EUR'}}
                      </td>
                      <td>
                        <button mat-icon-button (click)="editTransaction(t)" color="primary">
                          <mat-icon>edit</mat-icon>
                        </button>
                      </td>
                  </tr>
                  <tr *ngIf="transactions.length === 0">
                    <td colspan="6" style="text-align: center;">No transactions found for this period.</td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .spacer { flex: 1 1 auto; }
    .controls { display: flex; gap: 20px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .stats { margin-bottom: 20px; }
    .negative { color: #f44336; font-weight: bold; }
    .positive { color: #4caf50; font-weight: bold; }
    .comment { font-size: 0.85em; color: #666; font-style: italic; display: flex; align-items: center; gap: 4px; }
    .comment-icon { font-size: 14px; width: 14px; height: 14px; }
    .fixed-badge { border-bottom: 2px solid #ff4081; padding-bottom: 2px; }
    .styled-table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
        font-size: 0.9em;
        font-family: sans-serif;
        min-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
        background: white;
    }
    .styled-table thead tr {
        background-color: #3f51b5;
        color: #ffffff;
        text-align: left;
    }
    .styled-table th, .styled-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #eeeeee;
    }
    .styled-table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    .styled-table tbody tr:last-of-type {
        border-bottom: 2px solid #3f51b5;
    }
    .actions { display: flex; gap: 10px; }
  `]
})
export class DashboardComponent implements OnInit {
  accounts: any[] = [];
  selectedAccountId: number | null = null;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years = [2023, 2024, 2025];
  transactions: any[] = [];
  budgets: any[] = [];
  categories: any[] = [];

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Budget' },
      { data: [], label: 'Actual' }
    ]
  };

  constructor(private apiService: ApiService, private router: Router, private dialog: MatDialog) {}

  ngOnInit() {
    this.apiService.getAccounts().subscribe(accs => {
      this.accounts = accs;
      if (accs.length > 0) {
        this.selectedAccountId = accs[0].id;
        this.loadData();
      }
    });
  }

  loadData() {
    if (!this.selectedAccountId) return;

    this.apiService.getTransactions(this.selectedAccountId).subscribe(ts => {
      this.transactions = ts.filter(t => {
          const d = new Date(t.bookingDate);
          return d.getMonth() + 1 === this.selectedMonth && d.getFullYear() === this.selectedYear;
      });
      this.updateChart();
    });

    this.apiService.getBudgets(this.selectedYear, this.selectedMonth).subscribe(bs => {
        this.budgets = bs;
        this.updateChart();
    });

    this.apiService.getCategories().subscribe(cs => {
        this.categories = cs;
        this.updateChart();
    });
  }

  updateChart() {
      if (this.categories.length === 0) return;

      const labels = this.categories.map(c => c.name);
      const budgetData = this.categories.map(c => {
          const b = this.budgets.find(bud => bud.category.id === c.id);
          return b ? b.amount : 0;
      });
      const actualData = this.categories.map(c => {
          return this.transactions
            .filter(t => t.category?.id === c.id)
            .reduce((sum, t) => sum + Math.abs(t.amount < 0 ? t.amount : 0), 0);
      });

      this.barChartData = {
          labels,
          datasets: [
              { data: budgetData, label: 'Budget', backgroundColor: '#3f51b5' },
              { data: actualData, label: 'Actual Spending', backgroundColor: '#ff4081' }
          ]
      };
  }

  addManualTransaction() {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.createManualTransaction(this.selectedAccountId!, result).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  editTransaction(transaction: any) {
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      data: { transaction, categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.updateTransaction(transaction.id, result).subscribe(() => {
          this.loadData();
        });
      }
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
