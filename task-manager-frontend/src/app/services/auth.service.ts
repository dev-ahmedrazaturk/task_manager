import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/`;  // Add your backend API URL
  private currentUserSubject: BehaviorSubject<User>;

  constructor(private http: HttpClient, private router: Router, private jwtHelper: JwtHelperService) {
    this.currentUserSubject = new BehaviorSubject<User>(this.getCurrentUser());
  }

  get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register/`, userData);
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}login/`, credentials);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null as any);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User {
    const token = localStorage.getItem('access_token');
    return token ? this.jwtHelper.decodeToken(token) : null as any;
  }

  setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.currentUserSubject.next(this.getCurrentUser());
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}profile/`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}
