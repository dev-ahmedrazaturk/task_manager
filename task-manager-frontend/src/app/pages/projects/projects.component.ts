import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule
  ]
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  users: any[] = [];
  user: any;
  isAdmin: boolean = false;
  projectForm: FormGroup;
  editingProjectId: number | null = null;
  showProjectModal: boolean = false;
  searchTerm: string = '';
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.user = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      assigned_users: [[]]
    });
  }

  ngOnInit(): void {
    this.fetchProjects();
    this.fetchUsers();
  }

  fetchProjects(): void {
    this.projectService.getAllProjects().subscribe((projects: any[]) => {
      this.projects = projects;
      this.dataSource.data = projects;
      this.dataSource.paginator = this.paginator;
    });
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe((users: any[]) => {
      this.users = users;
    });
  }

  openProjectModal(project: any = null): void {
    this.showProjectModal = true;
    if (project) {
      this.editingProjectId = project.id;
      this.projectForm.patchValue({
        name: project.name,
        description: project.description,
        assigned_users: project.assigned_users.map((user: any) => user.id)
      });
    }
  }

  closeProjectModal(): void {
    this.showProjectModal = false;
    this.resetForm();
  }

  createOrUpdateProject(): void {
    if (this.projectForm.invalid) return;
    const projectData = {
      ...this.projectForm.value,
      assigned_users: this.projectForm.value.assigned_users.map((userId: number | string) => Number(userId))
    };

    debugger;

    if (this.editingProjectId) {
      this.projectService.updateProject(this.editingProjectId, projectData).subscribe(() => {
        this.fetchProjects();
        this.closeProjectModal();
      });
    } else {
      this.projectService.createProject(projectData).subscribe(() => {
        this.fetchProjects();
        this.closeProjectModal();
      });
    }
  }

  deleteProject(projectId: number): void {
    if (!this.isAdmin) return;
    this.projectService.deleteProject(projectId).subscribe(() => {
      this.fetchProjects();
    });
  }

  resetForm(): void {
    this.editingProjectId = null;
    this.projectForm.reset();
  }

  getAssignedUsernames(project: any): string {
    return project.assigned_users?.map((user: any) => user.username).join(', ') || 'No users assigned';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
