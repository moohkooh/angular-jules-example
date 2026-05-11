import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{data.transaction ? 'Edit' : 'New'}} Transaction</h2>
    <mat-dialog-content>
      <div class="form">
        <mat-form-field appearance="outline">
          <mat-label>Booking Date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="form.bookingDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Partner Name</mat-label>
          <input matInput [(ngModel)]="form.partnerName">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Purpose</mat-label>
          <input matInput [(ngModel)]="form.purpose">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Amount</mat-label>
          <input matInput type="number" [(ngModel)]="form.amount">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="form.categoryId">
            <mat-option [value]="null">None</mat-option>
            <mat-option *ngFor="let c of data.categories" [value]="c.id">{{c.name}}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox [(ngModel)]="form.isFixedCost">Fixed Cost</mat-checkbox>

        <mat-form-field appearance="outline">
          <mat-label>Comment / Details</mat-label>
          <textarea matInput rows="3" [(ngModel)]="form.comment"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 10px; min-width: 400px; padding-top: 10px; }
  `]
})
export class TransactionDialogComponent {
  form: any = {
    bookingDate: new Date(),
    partnerName: '',
    purpose: '',
    amount: 0,
    categoryId: null,
    isFixedCost: false,
    comment: '',
    currency: 'EUR'
  };

  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.transaction) {
      this.form = {
        ...data.transaction,
        categoryId: data.transaction.category?.id || null,
        bookingDate: new Date(data.transaction.bookingDate)
      };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.form);
  }
}
