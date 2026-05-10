import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Bank Manager Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" name="username" required>
            </mat-form-field>
            <mat-form-field appearance="fill">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" name="password" required>
            </mat-form-field>
            <div class="actions">
              <button mat-raised-button color="primary" type="submit">Login</button>
              <button mat-button type="button" (click)="onRegister()">Register</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    mat-card {
      width: 400px;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    .actions {
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => alert('Login failed')
    });
  }

  onRegister() {
    this.authService.register(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => alert('Registration failed')
    });
  }
}
