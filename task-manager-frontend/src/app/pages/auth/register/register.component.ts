import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user',
  standalone: true,  
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent {

  addUserForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.addUserForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_admin: [false]
    });
  }

  addUser(): void {
    if (this.addUserForm.invalid) return;

    const userData = this.addUserForm.value;
    this.authService.register(userData).subscribe(
      (response) => {
        alert('User added successfully!');
        this.router.navigate(['/users']);
      },
      (error) => {
        this.errorMessage = 'User creation failed. Please try again.';
      }
    );
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
