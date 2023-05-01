import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ILoginData, IResponse, Role } from '../types/index';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  public name: string = '';
  public roomNumber: string = '';
  public houseNumber: string = '';
  public role: Role = Role.User;

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  setToken(token: string): void {
    localStorage.setItem('jwt', token);
    // const jwtPayload = JSON.parse(token.split('.')[1]);
    //decode jwt and get the data
    const decoded = jwt_decode(token) as ILoginData;
    console.log('jwtPayload:', decoded);
    this.name = decoded.name;
    this.roomNumber = decoded.room;
    this.houseNumber = decoded.house;
    this.role = decoded.role!;
  }

  authenticate(loginData: ILoginData): Observable<IResponse<string>> {
    return this.http.post<IResponse<string>>(`${this.API_URL}/auth/login`, loginData).pipe(
      catchError(error => {
        console.error('Error during authentication:', error);
        return throwError(error);
      }),
      tap(response => {
        // Store the JWT token in local storage and update the BehaviorSubject^
        const jwtToken = response.data;
        this.setToken(jwtToken);
      })
    );
  }

  getTokenExpirationDate(): number | null {
    const token = this.getToken();
    if (!token) return null;

    const jwtPayload = JSON.parse(atob(token.split('.')[1]));
    console.log('jwtDateEXP:');
    console.log(new Date(jwtPayload.expDate));

    return jwtPayload.expDate;
  }

  refreshToken(): Observable<void> {
    return this.http.post<{ token: string }>(`${this.API_URL}/auth/refreshToken`, {}).pipe(
      catchError(error => {
        console.error('Error refreshing token:', error);
        this.clearToken();
        return throwError(error);
      }),
      map(res => {
        this.setToken(res.token);
      })
    );
  }

  clearToken(): void {
    localStorage.removeItem('jwt');
    this.name = '';
    this.roomNumber = '';
    this.houseNumber = '';
    this.role = Role.User;
  }
}
