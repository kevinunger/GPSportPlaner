import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ILoginData, IResponse, Role } from '../types/index';
import jwt_decode, { JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  public name: string = '';
  public roomNumber: string = '';
  public houseNumber: string = '';
  private _role: BehaviorSubject<Role> = new BehaviorSubject<Role>(Role.User);
  role = this._role.asObservable();

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  getName(): string {
    return this.name;
  }

  getRole(): Observable<Role> {
    return this.role;
  }

  getRoomNumber(): string {
    return this.roomNumber;
  }

  getHouseNumber(): string {
    return this.houseNumber;
  }

  setLoginData(decodedTokenString: ILoginData): void {
    this.name = decodedTokenString.name;
    this.roomNumber = decodedTokenString.room;
    this.houseNumber = decodedTokenString.house;
    this._role.next(decodedTokenString.role!);
  }

  initToken(): void {
    const token = this.getToken();
    if (token) {
      const decoded = jwt_decode(token) as ILoginData;
      this.setLoginData(decoded);
    }
  }

  setToken(token: string): void {
    localStorage.setItem('jwt', token);
    const decoded = jwt_decode(token) as ILoginData;

    this.setLoginData(decoded);
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
    interface JWT extends JwtPayload {
      exp: number;
    }
    const token = this.getToken();
    if (!token) return null;
    const decoded = jwt_decode(token) as JWT;
    console.log(decoded);

    return decoded.exp;
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
    this._role.next(Role.User); // Set default role or whatever makes sense
  }

  logout(): void {
    console.log('logout 1');
    this.clearToken();
    localStorage.clear();
  }
}
