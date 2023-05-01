import { throwError, tap, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse } from '../types/index';
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
    currentTime: 0,
  });

  private selectedBookingsByUser: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>([]);
  private confirmedBookingsByUser: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>([]);
  private enteredName: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  public getBookings(): Observable<IResponse<IBooking[]>> {
    return this.bookings.asObservable();
  }

  public getSelectedBookingsByUser(): Observable<IBooking[]> {
    return this.selectedBookingsByUser.asObservable();
  }

  public getConfirmedBookingsByUser(): Observable<IBooking[]> {
    return this.confirmedBookingsByUser.asObservable();
  }

  public setConfirmedBookingsByUser(bookings: IBooking[]): void {
    console.log('setConfirmedBookingsByUser');
    console.log(bookings);
    this.confirmedBookingsByUser.next(bookings);
  }

  public getEnteredName(): Observable<string> {
    return this.enteredName.asObservable();
  }

  public setEnteredName(name: string): void {
    this.enteredName.next(name);
  }

  private orderBookingsByStartTime(): void {
    const bookings = this.selectedBookingsByUser.getValue();
    // bookings are momentJS objects
    // sort ascending
    bookings.sort((a, b) => {
      if (moment(a.start).isBefore(b.start)) {
        return -1;
      }
      if (moment(a.start).isAfter(b.start)) {
        return 1;
      }
      return 0;
    });
    this.selectedBookingsByUser.next(bookings);
  }

  public setSelectedBookingsByUser(bookings: IBooking[]): void {
    // order bookings by start time (ascending)
    this.orderBookingsByStartTime();
    this.selectedBookingsByUser.next(bookings);
  }

  public getNameOfBookings(): Observable<string> {
    return this.selectedBookingsByUser.asObservable().pipe(
      map(bookings => {
        if (bookings.length > 0) {
          return bookings[0].bookedBy;
        }
        return '';
      })
    );
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
    this.selectedBookingsByUser.next(bookings);
    this.orderBookingsByStartTime();
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
  public fetchAndUpdateBookings(): Observable<IResponse<IBooking[]>> {
    console.log('fetchAndUpdateBookings');
    return this.http.get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getCurrentBookings`).pipe(
      catchError(error => {
        console.error('Error fetching current bookings:', error);
        return throwError(error);
      }),
      tap(response => {
        // Convert string to moment
        response.data.forEach(booking => {
          booking.start = booking.start;
          booking.end = booking.end;
        });

        this.bookings.next(response);
        console.log('found ', this.bookings.getValue().data.length, ' bookings');
      })
    );
  }
  public fetchAndUpdateBookingsByDate(date: moment.Moment): Observable<IResponse<IBooking[]>> {
    console.log('fetchAndUpdateBookingsByDate');
    return this.http
      .get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getBookingsByDate/?day=${date.toString()}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching bookings by date:', error);
          return throwError(error);
        }),
        tap(response => {
          // Convert string to moment
          response.data.forEach(booking => {
            booking.start = booking.start;
            booking.end = booking.end;
          });

          this.bookings.next(response);
          console.log('found ', this.bookings.getValue().data.length, ' bookings for ', date.toString());
        })
      );
  }

  public submitBookings(bookings: IBooking[]): Observable<IResponse<IBooking[]> | IErrorResponse> {
    console.log('submitBookings');
    console.log(bookings);

    const subject = new Subject<IResponse<IBooking[]> | IErrorResponse>();

    this.http
      .post<IResponse<IBooking[]>>(`${this.API_URL}/bookings/addBooking`, bookings)
      .pipe(
        catchError(error => {
          console.error('Error submitting bookings:', error);
          subject.error(error);
          return throwError(error);
        })
      )
      .subscribe(response => {
        this.fetchAndUpdateBookings();
        subject.next(response);
        subject.complete();
      });

    return subject.asObservable();
  }
}
