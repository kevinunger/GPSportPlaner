import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IAdmin } from '../types/index';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly API_URL = environment.apiUrl;
  backendIsAlive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  admins: BehaviorSubject<IAdmin[]> = new BehaviorSubject<IAdmin[]>([]);
  constructor(private http: HttpClient) {}

  public getAdmins(): Observable<IAdmin[]> {
    return this.admins.asObservable();
  }

  public setAdmins(admins: IAdmin[]) {
    this.admins.next(admins);
  }

  public fetchAndSetAdmins(): Observable<IResponse<IAdmin[]>> {
    return this.http.get<IResponse<IAdmin[]>>(`${this.API_URL}/admins`).pipe(
      catchError(error => {
        console.error('Error fetching admins:', error);
        return throwError(error);
      }),
      tap(res => {
        this.setAdmins(res.data);
      })
    );
  }

  public addAdmin(admin: IAdmin): Observable<IAdmin> {
    return this.http.post<IAdmin>(`${this.API_URL}/admins/addAdmin`, admin).pipe(
      catchError(error => {
        console.error('Error adding admin:', error);
        return throwError(() => error);
      })
    );
  }

  public editAdmin(oldAdmin: IAdmin, newAdmin: IAdmin): Observable<IAdmin> {
    return this.http.put<IAdmin>(`${this.API_URL}/admins/editAdmin`, { oldAdmin, newAdmin }).pipe(
      catchError(error => {
        console.error('Error editing admin:', error);
        return throwError(() => error);
      })
    );
  }

  public deleteAdmin(admin: IAdmin): Observable<IAdmin> {
    return this.http.delete<IAdmin>(`${this.API_URL}/admins/deleteAdmin`, { body: admin }).pipe(
      catchError(error => {
        console.error('Error deleting admin:', error);
        return throwError(() => error);
      })
    );
  }
}
