import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse } from '../../../../backend/src/types/index';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly API_URL = environment.apiUrl;
  private bookings: BehaviorSubject<IResponse<IBooking[]>> = new BehaviorSubject<IResponse<IBooking[]>>({
    data: [],
    currentTime: moment(0),
  });

  private selectedBookingsByUser: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>([]);

  constructor(private http: HttpClient) {}

  public getBookings(): Observable<IResponse<IBooking[]>> {
    return this.bookings.asObservable();
  }

  public getSelectedBookingsByUser(): Observable<IBooking[]> {
    return this.selectedBookingsByUser.asObservable();
  }

  private orderBookingsByStartTime(): void {
    const bookings = this.selectedBookingsByUser.getValue();
    bookings.sort((a, b) => a.start.valueOf() - b.start.valueOf());
    this.selectedBookingsByUser.next(bookings);
  }

  public setSelectedBookingsByUser(bookings: IBooking[]): void {
    // order bookings by start time (ascending)
    this.orderBookingsByStartTime();
    this.selectedBookingsByUser.next(bookings);
  }

  public changeNameOfBookings(name: string): void {
    const bookings = this.selectedBookingsByUser.getValue();
    bookings.forEach(booking => (booking.bookedBy = name));
    console.log(bookings);
    this.selectedBookingsByUser.next(bookings);
  }

  public addBooking(booking: IBooking): void {
    const bookings = this.selectedBookingsByUser.getValue();
    bookings.push(booking);
    this.orderBookingsByStartTime();
    this.selectedBookingsByUser.next(bookings);
  }

  public removeBooking(booking: IBooking): void {
    const bookings = this.selectedBookingsByUser.getValue();
    const index = bookings.findIndex(b => b.start === booking.start && b.end === booking.end);
    if (index > -1) {
      bookings.splice(index, 1);
    }
    this.selectedBookingsByUser.next(bookings);
  }

  // get current bookings ( bookings that are not in the past)
  public fetchAndUpdateBookings() {
    console.log('fetchAndUpdateBookings');
    this.http.get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getCurrentBookings`).subscribe(response => {
      // convert string to moment
      response.data.forEach(booking => {
        booking.start = moment(booking.start);
        booking.end = moment(booking.end);
      });
      response.currentTime = moment(response.currentTime);
      this.bookings.next(response);
    });
  }

  public fetchAndUpdateBookingsByDate(date: moment.Moment) {
    console.log('fetchAndUpdateBookingsByDate');
    this.http
      .get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getBookingsByDate/?day=${date.toString()}`)
      .subscribe(response => {
        // convert string to moment
        response.data.forEach(booking => {
          booking.start = moment(booking.start);
          booking.end = moment(booking.end);
        });
        response.currentTime = moment(response.currentTime);
        this.bookings.next(response);
        console.log('found ', this.bookings.getValue().data.length, ' bookings for ', date.toString());
      });
  }

  public async submitBookings(bookings: IBooking[]): Promise<Observable<IResponse<IBooking[]> | IErrorResponse>> {
    console.log('submitBookings');
    console.log(bookings);
    var subject = new Subject<IResponse<IBooking[]> | IErrorResponse>();
    await this.http.post<IResponse<IBooking[]>>(`${this.API_URL}/bookings/addBooking`, bookings).subscribe(response => {
      this.fetchAndUpdateBookings();
      return response;
    });
    return subject.asObservable();
  }
}
