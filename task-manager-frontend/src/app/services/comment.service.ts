import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Comment } from '../models/comment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}comments/`;

  constructor(private http: HttpClient) {}

  getCommentsByTask(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?task=${taskId}`);
  }

  getCommentCount(taskId: number): Observable<any> {
    return this.http.get<number>(`${this.apiUrl}count/?task_id=${taskId}`);
  }

  createComment(commentData: any): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, commentData);
  }

  updateComment(commentId: number, commentData: any): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}${commentId}/`, commentData);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${commentId}/`);
  }
}
