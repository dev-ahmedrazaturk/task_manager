import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,  // ✅ Ensure it's a standalone component
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule]  // ✅ Keep only ONE `imports` property
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_admin: [false]
    });
  }

  register(): void {
    if (this.registerForm.invalid) return;

    const userData = this.registerForm.value;
    this.authService.register(userData).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    );
  }
}
