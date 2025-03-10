import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}tasks/`;

  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTasksByProject(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}by-project/?project_id=${projectId}`);
  }

  getTasksByUserOrAll(filters: { status?: string; due_date?: string; user_id?: string }): Observable<any> {
    let params = new HttpParams();
    
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.due_date) {
      params = params.set('due_date', filters.due_date);
    }
    if (filters.user_id) {
      params = params.set('user_id', filters.user_id);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  createTask(taskData: any): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, taskData);
  }

  updateTask(taskId: number, taskData: any): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}${taskId}/`, taskData);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${taskId}/`);
  }
}
