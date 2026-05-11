import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatSelectModule, MatCheckboxModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <button mat-button routerLink="/">Cancel</button>
      <h2>Import Transactions</h2>

      <div *ngIf="!previewData.length">
        <input type="file" (change)="onFileSelected($event)" accept=".csv">
        <p>Please upload your Sparkasse CSV export file.</p>
      </div>

      <div *ngIf="previewData.length">
        <h3>Confirm Transactions</h3>
        <p>Assign categories for unknown transactions. If you assign a category, we will remember it for next time.</p>

        <table class="styled-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Partner / Purpose</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Fixed?</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let t of previewData">
                    <td>{{t.bookingDate | date:'shortDate'}}</td>
                    <td>
                        <strong>{{t.partnerName}}</strong><br>
                        <small>{{t.purpose}}</small>
                    </td>
                    <td>{{t.amount | currency:'EUR'}}</td>
                    <td>
                        <mat-select [(ngModel)]="t.categoryId" (selectionChange)="onCategoryManualChange(t)">
                            <mat-option [value]="null">None</mat-option>
                            <mat-option *ngFor="let c of categories" [value]="c.id">{{c.name}}</mat-option>
                        </mat-select>
                    </td>
                    <td>
                        <mat-checkbox [(ngModel)]="t.isFixedCost"></mat-checkbox>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="actions">
            <button mat-raised-button color="primary" (click)="confirm()">Confirm & Save</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .styled-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .styled-table td, .styled-table th { padding: 10px; border-bottom: 1px solid #ddd; }
    .actions { margin-top: 20px; text-align: right; }
  `]
})
export class ImportComponent implements OnInit {
  accountId!: number;
  categories: any[] = [];
  previewData: any[] = [];
  manualRules: Map<string, number> = new Map();

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.accountId = Number(this.route.snapshot.paramMap.get('accountId'));
    this.apiService.getCategories().subscribe(cs => this.categories = cs);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.apiService.importCsv(this.accountId, file).subscribe(data => {
        this.previewData = data;
      });
    }
  }

  onCategoryManualChange(transaction: any) {
    if (transaction.categoryId && transaction.partnerName) {
      this.manualRules.set(transaction.partnerName, transaction.categoryId);
    }
  }

  confirm() {
    const newRules = Array.from(this.manualRules.entries()).map(([pattern, categoryId]) => ({
      pattern,
      categoryId
    }));

    if (newRules.length > 0) {
      this.apiService.createRulesBulk(newRules).subscribe(() => {
        this.finalizeImport();
      });
    } else {
      this.finalizeImport();
    }
  }

  private finalizeImport() {
    this.apiService.confirmImport(this.accountId, this.previewData, []).subscribe(() => {
        this.router.navigate(['/']);
    });
  }
}
