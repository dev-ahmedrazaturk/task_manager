import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}users/`;

  constructor(private http: HttpClient) {}

  getAllUsers(activeOnly: boolean = true): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?all=${!activeOnly}`);
  }
  

  addUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${id}/`, user);
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${id}/`, { is_active: false });
  }

  activateUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}${id}/`, { is_active: true });
  }
}
