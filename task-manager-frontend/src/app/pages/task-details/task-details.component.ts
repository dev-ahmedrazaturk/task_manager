import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Comment } from '../../models/comment.model';
import { CommentService } from '../../services/comment.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {
  task: Task;
  comments: Comment[] = [];
  commentForm: FormGroup;
  editingCommentId: number | null = null;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private commentService: CommentService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<TaskDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task }
  ) {
    this.task = data.task;
    this.commentForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchComments();
    this.fetchCurrentUser();
  }

  fetchComments(): void {
    this.commentService.getCommentsByTask(this.task.id).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  fetchCurrentUser(): void {
    this.authService.getProfile().subscribe(user => {
      this.currentUser = user;
    });
  }

  addComment(): void {
    if (this.commentForm.invalid) return;

    const commentData = {
      text: this.commentForm.value.text,
      task_id: this.task.id
    };

    if (this.editingCommentId) {
      this.commentService.updateComment(this.editingCommentId, commentData).subscribe(() => {
        this.fetchComments();
        this.commentForm.reset();
        this.editingCommentId = null;
      });
    } else {
      this.commentService.createComment(commentData).subscribe(() => {
        this.fetchComments();
        this.commentForm.reset();
      });
    }
  }

  editComment(comment: Comment): void {
    if (comment.user.id === this.currentUser.id) {
      this.editingCommentId = comment.id;
      this.commentForm.patchValue({
        text: comment.text
      });
    }
  }

  deleteComment(commentId: number): void {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment && comment.user.id === this.currentUser.id) {
      this.commentService.deleteComment(commentId).subscribe(() => {
        this.fetchComments();
      });
    }
  }

  getAssignedUsernames(task: Task): string {
    return task.assigned_to?.map((user: any) => user.username).join(', ') || 'No users assigned';
  }
}
