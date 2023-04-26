import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse, IAdmin } from '../types/index';
import { Observable, BehaviorSubject, Subject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import * as moment from 'moment';

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
        console.log('AdminsR:', res.data);
        this.setAdmins(res.data);
      })
    );
  }

  public getAllAdmins() {}
}
