import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { ILoginData, IResponse, Role, TokenPayload } from '../types/index';
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
    // return token and check if it is valid
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    const segments = token.split('.');
    if (segments.length !== 3) {
      console.error('Token structure is incorrect.');
      return null;
    }

    try {
      const decoded = jwt_decode(token) as TokenPayload;

      return token;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getName(): string {
    return this.name;
  }

  getRoom(): string {
    return this.roomNumber;
  }

  getHouse(): string {
    return this.houseNumber;
  }

  getRole(): Observable<Role> {
    return this.role;
  }

  getTokenData(): TokenPayload | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = jwt_decode(token) as TokenPayload;
    return decoded;
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
    // check validity
    // console.log(jwt_decode(token));

    const decoded = jwt_decode(token) as JWT;

    return decoded.exp;
  }

  refreshToken(): Observable<IResponse<string>> {
    const token = this.getToken();
    return this.http
      .post<IResponse<string>>(`${this.API_URL}/auth/refreshToken`, { token: token })
      .pipe(
        catchError(error => {
          console.error('Error refreshing token:', error);
          // this.clearToken();
          return throwError(() => error);
        }),
        tap(res => {
          // console.log('refreshed token:', res.data);
          this.setToken(res.data);
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
    this.clearToken();
    localStorage.clear();
  }
}
