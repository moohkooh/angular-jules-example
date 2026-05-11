import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <button mat-button routerLink="/">Back to Dashboard</button>
      <h2>Manage Bank Accounts</h2>

      <mat-card class="add-card">
        <mat-card-header><mat-card-title>Add New Account</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="form">
            <mat-form-field appearance="fill">
              <mat-label>Account Name (e.g. Giro)</mat-label>
              <input matInput [(ngModel)]="newName">
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>IBAN</mat-label>
              <input matInput [(ngModel)]="newIban">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="addAccount()">Add</button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="account-list">
        <mat-card *ngFor="let acc of accounts" class="acc-item">
          <mat-card-header>
            <mat-card-title>{{acc.name}}</mat-card-title>
            <mat-card-subtitle>{{acc.iban}}</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    .add-card { margin-bottom: 20px; }
    .form { display: flex; gap: 10px; align-items: center; }
    .account-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .acc-item { margin-top: 10px; }
  `]
})
export class AccountsComponent implements OnInit {
  accounts: any[] = [];
  newName = '';
  newIban = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.apiService.getAccounts().subscribe(accs => this.accounts = accs);
  }

  addAccount() {
    if (!this.newName || !this.newIban) return;
    this.apiService.createAccount(this.newName, this.newIban).subscribe(() => {
      this.newName = '';
      this.newIban = '';
      this.loadAccounts();
    });
  }
}
