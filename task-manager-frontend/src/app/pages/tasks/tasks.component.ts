import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { ProjectService } from '../../services/project.service';
import { CommentService } from '../../services/comment.service';
import { MatCardModule } from '@angular/material/card';
import { TaskDetailsComponent } from '../task-details/task-details.component';
import { AuthService } from '../../services/auth.service';
import { forkJoin, map, Observable } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  imports: [
    MatSnackBarModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ]
})
export class TasksComponent implements OnInit {
  projectId!: number;
  tasks: Task[] = [];
  users: any[] = [];
  taskForm: FormGroup;
  editingTaskId: number | null = null;
  dataSource = new MatTableDataSource<Task>([]);
  displayedColumns: string[] = ['title', 'description', 'dueDate', 'priority', 'status', 'assignedUsers', 'project', 'actions'];
  searchTerm: string = '';
  projectName: string = '';
  selectedTask: Task = {} as Task;
  isAdmin: boolean = false;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('taskDialog') taskDialog!: TemplateRef<any>;
  @ViewChild('taskDetailDialog') taskDetailDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['ToDo', Validators.required],
      assigned_to: [[]],
    });
    this.isAdmin = this.authService.getCurrentUser()?.is_admin || false;

  }

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('projectId')!;
    this.fetchProjectName();
    this.fetchTasksByProject();
    this.fetchUsers();
  }

  fetchTasksByProject(): void {
    if (this.projectId) {
      this.taskService.getTasksByProject(this.projectId).subscribe((tasks: Task[]) => {
        const taskRequests = tasks.map(task =>
          this.commentService.getCommentCount(task.id).pipe(
            map(count => ({ ...task, count: count.comment_count }))
          )
        );
  
        forkJoin(taskRequests).subscribe(updatedTasks => {
          this.tasks = updatedTasks.map(task => ({
            ...task,
            project_name: task.project?.name || 'N/A'
          }));
  
          this.dataSource.data = this.tasks;
          this.dataSource.paginator = this.paginator;
        });
      });
    }
  }
  

  fetchProjectName(): void {
    this.projectService.getProjectById(this.projectId).subscribe(project => {
      this.projectName = project.name;
    });
  }
  fetchUsers(): void {
    this.userService.getAllUsers().subscribe((users: any[]) => {
      this.users = users;
    });
  }

  openTaskModal(task: Task | null = null): void {
    if (task) {
      this.editingTaskId = task.id;
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        priority: task.priority,
        status: task.status,
        assigned_to: task.assigned_to.map((user: any) => user.id),
      });
    }
    this.dialog.open(this.taskDialog, { width: '600px' });
  }

  closeTaskModal(): void {
    this.editingTaskId = null;
    this.taskForm.reset();
    this.dialog.closeAll();
  }

  createOrUpdateTask(): void {
    if (this.taskForm.invalid) return;

    const taskData = {
      ...this.taskForm.value,
      project: this.projectId,
      assigned_to: this.taskForm.value.assigned_to.map((userId: number) => Number(userId)),
    };

    if (this.editingTaskId) {
      this.taskService.updateTask(this.editingTaskId, taskData).subscribe((response: any) => {
        this.fetchTasksByProject();
        this.closeTaskModal();
        this.showNotification(`Task "${response.title}" updated successfully!`);
      });
    } else {
      this.taskService.createTask(taskData).subscribe((response: any) => {
        this.fetchTasksByProject();
        this.closeTaskModal();
        this.showNotification(`Task "${response.title}" updated successfully!`);
      });
    }
  }

  getAssignedUsernames(task: Task): string {
    return task.assigned_to?.map((user: any) => user.username).join(', ') || 'No users assigned';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: Task, filter: string) => {
      return data.title.toLowerCase().includes(filter) || data.description.toLowerCase().includes(filter);
    };
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTask(taskId).subscribe(
      (response: any) => {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.dataSource.data = this.tasks;
        this.dataSource.paginator = this.paginator;

        this.showNotification(response.message || "Task deleted successfully!");

        setTimeout(() => this.fetchTasksByProject(), 500);
      },
      (error) => {
        this.showNotification(error.error?.error || "Failed to delete the Task.", "Retry");
      }
    );
  }

  navigateToProjects(): void {
    window.location.href = '/projects';
  }

  navigateToDashboard(): void {
    window.location.href = '/dashboard';
  }

  openTaskDetailDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailsComponent, {
        width: '1000px',
        data: { task }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchTasksByProject();
    });
  }

  showNotification(message: string, action: string = "Close"): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["custom-snackbar"]
    });
  }
  
}
