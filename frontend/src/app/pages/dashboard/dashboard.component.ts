import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

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

        <button mat-raised-button color="accent" *ngIf="selectedAccountId" [routerLink]="['/import', selectedAccountId]">
          Import Transactions
        </button>
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
                      <th>Purpose</th>
                      <th>Category</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  <tr *ngFor="let t of transactions">
                      <td>{{t.bookingDate | date}}</td>
                      <td>{{t.partnerName}}</td>
                      <td>{{t.purpose}}</td>
                      <td>{{t.category?.name || 'Uncategorized'}}</td>
                      <td [class.negative]="t.amount < 0" [class.positive]="t.amount > 0">
                        {{t.amount | currency:'EUR'}}
                      </td>
                  </tr>
                  <tr *ngIf="transactions.length === 0">
                    <td colspan="5" style="text-align: center;">No transactions found for this period.</td>
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

  constructor(private apiService: ApiService, private router: Router) {}

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

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
