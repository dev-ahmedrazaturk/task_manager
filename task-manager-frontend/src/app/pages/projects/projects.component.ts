import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule
  ]
  
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  users: any[] = [];
  projectForm: FormGroup;
  editingProjectId: number | null = null;
  dataSource = new MatTableDataSource<any>([]);
  searchTerm: string = '';
  displayedColumns: string[] = ['name', 'description', 'assignedUsers', 'actions'];
  isAdmin: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('projectDialog') projectDialog!: TemplateRef<any>;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      assigned_users: [[]],
    });

    this.isAdmin = this.authService.getCurrentUser()?.is_admin || false;

  }

  ngOnInit(): void {
    this.fetchProjects();
    this.fetchUsers();
  }

  fetchProjects(): void {
    this.projectService.getAllProjects().subscribe((projects: any[]) => {
      this.projects = projects;
      this.dataSource.data = projects;
    });
  }

  fetchUsers(): void {
    this.userService.getAllUsers().subscribe((users: any[]) => {
      this.users = users;
    });
  }

  openProjectModal(project: any = null): void {
    if (project) {
      this.editingProjectId = project.id;
      this.projectForm.patchValue({
        name: project.name,
        description: project.description,
        assigned_users: project.assigned_users.map((user: any) => user.id),
      });
    }
    this.dialog.open(this.projectDialog, { width: '500px' });
  }

  closeProjectModal(): void {
    this.editingProjectId = null;
    this.projectForm.reset();
    this.dialog.closeAll();
  }

  createOrUpdateProject(): void {
    if (this.projectForm.invalid) return;

    const projectData = {
      ...this.projectForm.value,
      assigned_users: this.projectForm.value.assigned_users.map((userId: number) => Number(userId)),
    };

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

  getAssignedUsernames(project: any): string {
    return project.assigned_users?.map((user: any) => user.username).join(', ') || 'No users assigned';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId).subscribe(() => this.fetchProjects());
  }

  navigateToDashboard(): void {
    window.location.href = '/dashboard';
  }
  
}
