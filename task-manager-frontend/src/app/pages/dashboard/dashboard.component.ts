import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',

})
export class DashboardComponent {
  user: any;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getCurrentUser();
  }

  projects(): void {
    this.router.navigate(['/projects']);
  }

  userManagement(): void {
    this.router.navigate(['/users']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
