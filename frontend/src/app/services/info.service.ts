import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse } from '../types/index';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  private readonly API_URL = environment.apiUrl;
  backendIsAlive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  constructor(private http: HttpClient) {}

  public getBackendIsAlive(): Observable<boolean> {
    return this.backendIsAlive.asObservable();
  }

  public checkIfBackendIsAlive() {
    console.log('checking');
    this.http.get<IResponse<String>>(`${this.API_URL}/info`).subscribe(
      response => {
        if (response.data === 'Hello World') {
          this.backendIsAlive.next(true);
        } else {
          this.backendIsAlive.next(false);
        }
        console.log(this.backendIsAlive);
      },
      error => {
        console.error('Error checking backend:', error);
        this.backendIsAlive.next(false);
        // check again in 10s
        setTimeout(() => {
          this.checkIfBackendIsAlive();
        }, 1000);
      }
    );
  }
}
