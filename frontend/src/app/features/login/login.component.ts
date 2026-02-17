import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="logo-icon">bolt</mat-icon>
            <h1>IncidentNow</h1>
            <p class="subtitle">Sign in to your account</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" autocomplete="email" />
              <mat-icon matPrefix>email</mat-icon>
              <mat-error>Valid email is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword() ? 'password' : 'text'"
                autocomplete="current-password"
              />
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error>Password is required</mat-error>
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-button"
              [disabled]="form.invalid || loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20" />
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="demo-hint">
            <p><strong>Demo credentials:</strong></p>
            <p>Email: alice&#64;incidentnow.io</p>
            <p>Password: demo1234</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 32px 24px;
    }

    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-bottom: 24px;
    }

    .logo-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      background: #c62828;
      color: white;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .login-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }

    .subtitle {
      margin: 4px 0 0;
      color: rgba(0, 0, 0, 0.54);
      font-size: 14px;
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #c62828;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .demo-hint {
      margin-top: 24px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }

    .demo-hint p {
      margin: 2px 0;
    }
  `,
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly hidePassword = signal(true);
    readonly loading = signal(false);
    readonly errorMessage = signal('');

    readonly form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
    });

    onSubmit(): void {
        if (this.form.invalid) return;

        this.loading.set(true);
        this.errorMessage.set('');

        const { email, password } = this.form.value;

        this.authService.login(email!, password!).subscribe({
            next: (owner) => {
                this.loading.set(false);
                if (owner) {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.errorMessage.set('Invalid email or password');
                }
            },
            error: () => {
                this.loading.set(false);
                this.errorMessage.set('Login failed. Please try again.');
            },
        });
    }
}
