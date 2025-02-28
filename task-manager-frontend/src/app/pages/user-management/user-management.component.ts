import { Component, OnInit, ViewChild, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatDialogModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  displayedColumns: string[] = ['username', 'email', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  searchTerm: string = '';
  isAdmin = true;
  userForm!: FormGroup;
  editingUserId: number | null = null;
  showActiveUsers = true;

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('userDialog') userDialog!: TemplateRef<any>;

  ngOnInit() {
    this.initializeForm();
    this.loadUsers();
  }

  initializeForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required], 
      email: ['', [Validators.required, Validators.email]],
      is_admin: [false],
    });
  }

  loadUsers() {
    this.userService.getAllUsers(this.showActiveUsers).subscribe(
      (users) => {
        console.log("API Data:", users);
  
        if (!users || users.length === 0) {
          console.warn("No users found");
          return;
        }
  
        this.dataSource = new MatTableDataSource(users.filter(user => user.is_active === this.showActiveUsers));

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
        }, 100);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  applyFilter() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  toggleActiveInactiveUsers() {
    this.showActiveUsers = !this.showActiveUsers;
    this.loadUsers();
  }

  openUserModal(user?: User) {
    this.editingUserId = user ? user.id : null;
    
    if (!this.userForm) {
      this.initializeForm();
    }

    this.userForm.patchValue(user || { username: '', email: '', is_admin: false });

    this.dialog.open(this.userDialog, {
      width: '400px',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  createOrUpdateUser() {
    const userPayload = {
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      email: this.userForm.value.email,
      is_admin: this.userForm.value.is_admin,
      is_active: true
    };

    if (this.editingUserId) {
      this.userService.updateUser(this.editingUserId, userPayload).subscribe(() => {
        this.loadUsers();
        this.closeUserModal();
      });
    } else {
      this.userService.addUser(userPayload).subscribe(() => {
        this.loadUsers();
        this.closeUserModal();
      });
    }
  }

  closeUserModal() {
    this.editingUserId = null;
    this.userForm.reset();
    this.dialog.closeAll();
  }

  toggleUserStatus(user: User) {
    if (user.is_active) {
      this.userService.deactivateUser(user.id).subscribe(() => {
        user.is_active = false;
        this.filterUsers();
      });
    } else {
      this.userService.activateUser(user.id).subscribe(() => {
        user.is_active = true;
        this.filterUsers();
      });
    }
  }

  filterUsers() {
    this.dataSource.data = this.dataSource.data.filter(user => user.is_active === this.showActiveUsers);
  }

  navigateToDashboard(): void {
    window.location.href = '/dashboard';
  }
}
