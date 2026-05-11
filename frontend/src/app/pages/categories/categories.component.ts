import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCheckboxModule, MatSelectModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <button mat-button routerLink="/">Back to Dashboard</button>
      <h2>Manage Categories & Budgets</h2>

      <div class="grid">
        <mat-card>
          <mat-card-header><mat-card-title>Add Category</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="fill">
              <mat-label>Category Name</mat-label>
              <input matInput [(ngModel)]="catName">
            </mat-form-field>
            <mat-checkbox [(ngModel)]="catFixed">Is Fixed Cost?</mat-checkbox>
            <button mat-raised-button color="primary" (click)="addCategory()">Add</button>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Set Budget ({{selectedMonth}}/{{selectedYear}})</mat-card-title></mat-card-header>
          <mat-card-content>
            <mat-form-field appearance="fill">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="budCatId">
                <mat-option *ngFor="let c of categories" [value]="c.id">{{c.name}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>Amount</mat-label>
              <input matInput type="number" [(ngModel)]="budAmount">
            </mat-form-field>
            <button mat-raised-button color="accent" (click)="setBudget()">Set Budget</button>
          </mat-card-content>
        </mat-card>
      </div>

      <h3>Current Categories</h3>
      <table class="styled-table">
          <thead>
              <tr><th>Name</th><th>Fixed Cost</th></tr>
          </thead>
          <tbody>
              <tr *ngFor="let c of categories">
                  <td>{{c.name}}</td>
                  <td>{{c.isFixedCost ? 'Yes' : 'No'}}</td>
              </tr>
          </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    mat-form-field { width: 100%; display: block; margin-bottom: 10px; }
    .styled-table { width: 100%; border-collapse: collapse; }
    .styled-table td, .styled-table th { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  catName = '';
  catFixed = false;

  budCatId: number | null = null;
  budAmount = 0;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.getCategories().subscribe(cs => this.categories = cs);
  }

  addCategory() {
    if (!this.catName) return;
    this.apiService.createCategory(this.catName, this.catFixed).subscribe(() => {
      this.catName = '';
      this.catFixed = false;
      this.loadCategories();
    });
  }

  setBudget() {
    if (!this.budCatId) return;
    this.apiService.upsertBudget(this.budCatId, this.selectedYear, this.selectedMonth, this.budAmount).subscribe(() => {
        alert('Budget updated');
    });
  }
}
