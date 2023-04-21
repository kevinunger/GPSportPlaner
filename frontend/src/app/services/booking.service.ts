import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking } from '../../../../backend/src/types/index';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly API_URL = environment.apiUrl;
  private bookings: BehaviorSubject<IResponse<IBooking[]>> = new BehaviorSubject<IResponse<IBooking[]>>({
    data: [],
    currentTime: 0,
    currentTimeZoneOffset: 0,
  });

  constructor(private http: HttpClient) {}

  public getBookings(): Observable<IResponse<IBooking[]>> {
    return this.bookings.asObservable();
  }

  public fetchAndUpdateBookings() {
    console.log('fetchAndUpdateBookings');
    console.log(this.API_URL);
    this.http.get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getBookings`).subscribe(response => {
      this.bookings.next(response);
      console.log(response.data);
    });
  }
}
