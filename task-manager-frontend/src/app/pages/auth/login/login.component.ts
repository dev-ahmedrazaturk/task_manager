import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,  // ✅ Ensure it's a standalone component
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule]  // ✅ Keep only ONE `imports` property
})

export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.value;
    this.authService.login(credentials).subscribe(
      (response) => {
        this.authService.setAccessToken(response.access);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        this.errorMessage = 'Invalid credentials. Please try again.';
      }
    );
  }
}
