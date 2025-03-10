import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TaskService } from '../../../services/task.service';
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
import { Task } from '../../../models/task.model';
import { CommentService } from '../../../services/comment.service';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../services/auth.service';
import { forkJoin, map } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskDetailsComponent } from '../../task-details/task-details.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css'],
  standalone: true,
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
export class MyTasksComponent implements OnInit, AfterViewInit {
  projectId!: number;
  tasks: Task[] = [];
  users: any[] = []; // List of unique users
  statuses: string[] = []; // List of unique statuses
  editingTaskId: number | null = null;
  dataSource = new MatTableDataSource<Task>([]);
  displayedColumns: string[] = ['title', 'description', 'dueDate', 'priority', 'status', 'assignedUsers', 'project', 'actions'];
  searchTerm: string = '';
  projectName: string = '';
  selectedTask: Task = {} as Task;
  isAdmin: boolean = false;

  // Filters object
  filters: { status?: string; due_date?: string; user_id?: string } = {
    status: '',
    due_date: '',
    user_id: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('taskDetailDialog') taskDetailDialog!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.isAdmin = this.authService.getCurrentUser()?.is_admin || false;
  }

  ngOnInit(): void {
    this.applyFilters(); // Apply default filters
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  fetchTasksByUserOrAll(filters: { status?: string; due_date?: string; user_id?: string }): void {
    console.log('Fetching tasks with filters:', filters);
    this.taskService.getTasksByUserOrAll(filters).subscribe((tasks: Task[]) => {
      console.log('Tasks fetched:', tasks);
      if (tasks.length > 0) {
        const taskRequests = tasks.map(task =>
          this.commentService.getCommentCount(task.id).pipe(
            map(count => ({ ...task, count: count.comment_count }))
        ));

        forkJoin(taskRequests).subscribe({
          next: (updatedTasks) => {
            this.tasks = updatedTasks.map(task => ({
              ...task,
              user_names: task.assigned_to?.map(user => user.username).join(', ') || 'N/A',
              project_name: task.project?.name || 'N/A'
            }));

            this.dataSource.data = this.tasks;
            console.log('Updated tasks:', this.tasks);

            this.extractFilterValues(this.tasks);

            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          },
          error: (err) => {
            console.error('Error fetching comment counts:', err);
            this.showNotification('Failed to fetch comment counts. Please try again.', 'Retry');
          }
        });
      } else {
        this.tasks = [];
        this.dataSource.data = [];
        this.statuses = []; 
        this.users = [];
      }
    }, error => {
      console.error('Error fetching tasks:', error);
      this.showNotification('Failed to fetch tasks. Please try again.', 'Retry');
    });
  }

  extractFilterValues(tasks: Task[]): void {
    this.statuses = [...new Set(tasks.map(task => task.status))];

    const allUsers = tasks.flatMap(task => task.assigned_to || []);
    this.users = [...new Map(allUsers.map(user => [user.id, user])).values()];
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters);
    this.fetchTasksByUserOrAll(this.filters);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: Task, filter: string) => {
      return data.title.toLowerCase().includes(filter) || data.description.toLowerCase().includes(filter);
    };
  }

  navigateToDashboard(): void {
    window.location.href = '/dashboard';
  }

  showNotification(message: string, action: string = "Close"): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "right",
      verticalPosition: "top",
      panelClass: ["custom-snackbar"]
    });
  }

  getAssignedUsernames(task: Task): string {
    return task.assigned_to?.map((user: any) => user.username).join(', ') || 'No users assigned';
  }

  openTaskDetailDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDetailsComponent, {
      width: '1000px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.applyFilters();
    });
  }
}