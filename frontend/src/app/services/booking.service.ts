import { throwError, tap, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse } from '../types/index';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly API_URL = environment.apiUrl;
  private bookings: BehaviorSubject<IResponse<IBooking[]>> = new BehaviorSubject<
    IResponse<IBooking[]>
  >({
    data: [],
    currentTime: 0,
  });

  private selectedBookingsByUser: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>([]);

  // confirmed bookings are bookings the user already submitted to the backend
  // purpose is to show the user that he just submitted these on the confirmation page
  private confirmedBookingsByUser: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>(
    []
  );

  // bookingsToRemove are bookings the user wants to remove from the backend
  private bookingsToRemove: BehaviorSubject<IBooking[]> = new BehaviorSubject<IBooking[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

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
    this.confirmedBookingsByUser.next(bookings);
  }

  public getBookingsToRemove(): Observable<IBooking[]> {
    return this.bookingsToRemove.asObservable();
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

  public getNameOfBookings(): Observable<string | undefined> {
    return this.selectedBookingsByUser.asObservable().pipe(
      map(bookings => {
        if (bookings.length > 0) {
          return bookings[0].bookedBy?.name;
        }
        return '';
      })
    );
  }

  public changeNameOfBookings(name: string): void {
    let bookings = this.selectedBookingsByUser.getValue();
    bookings = this._addUserToBookings(bookings);
    console.log(bookings);
    this.selectedBookingsByUser.next(bookings);
  }

  public addBooking(booking: IBooking): void {
    const bookings = this.selectedBookingsByUser.getValue();
    // remove booking from bookingsToRemove if it is in there
    const index = this.bookingsToRemove
      .getValue()
      .findIndex(b => b.start === booking.start && b.end === booking.end);
    if (index > -1) {
      // remove booking from bookingsToRemove
      const bookingsToRemove = this.bookingsToRemove.getValue();
      bookingsToRemove.splice(index, 1);
      this.bookingsToRemove.next(bookingsToRemove);
    } else {
      bookings.push(booking);
      this.selectedBookingsByUser.next(bookings);
      this.orderBookingsByStartTime();
    }
    console.log('to remove: ', this.bookingsToRemove.getValue());
    console.log('selected: ', this.selectedBookingsByUser.getValue());
  }

  public removeBooking(booking: IBooking): void {
    // triggered on unCheck
    // check if booking is in selectedBookingsByUser
    // if yes that means that the user selected and then deselected the booking (initial booking flow)
    // if no that means that the user deselected the booking that was already submitted to the backend (change booking flow)

    const bookings = this.selectedBookingsByUser.getValue();

    const index = bookings.findIndex(b => b.start === booking.start && b.end === booking.end);
    // yes -> remove booking from selectedBookingsByUser
    if (index > -1) {
      bookings.splice(index, 1);
    }
    // no -> add booking to selectedBookingsByUser
    else {
      this.bookingsToRemove.next([...this.bookingsToRemove.getValue(), booking]);
      console.log('to remove: ', this.bookingsToRemove.getValue());
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
      })
    );
  }
  public fetchAndUpdateBookingsByDate(date: moment.Moment): Observable<IResponse<IBooking[]>> {
    console.log('fetchAndUpdateBookingsByDate');
    return this.http
      .get<IResponse<IBooking[]>>(
        `${this.API_URL}/bookings/getBookingsByDate/?day=${date.toString()}`
      )
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
          console.log(
            'found ',
            this.bookings.getValue().data.length,
            ' bookings for ',
            date.toString()
          );
        })
      );
  }

  public submitBookings(bookings: IBooking[]): Observable<IResponse<IBooking[]> | IErrorResponse> {
    let bookingsToAdd = this.selectedBookingsByUser.getValue();
    let bookingsToRemove = this.bookingsToRemove.getValue();

    // if bookingsToRemove is empty -> /addBooking with bookingsToAdd
    // if bookingsToRemove is not empty -> /changeBooking with bookingsToRemove and bookingsToAdd

    bookingsToAdd = this._addUserToBookings(bookingsToAdd);
    bookingsToRemove = this._addUserToBookings(bookingsToRemove);

    // post to /addBooking
    if (bookingsToRemove.length === 0) {
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
    // post to /changeBooking
    else {
      const subject = new Subject<IResponse<IBooking[]> | IErrorResponse>();

      this.http
        .post<IResponse<IBooking[]>>(`${this.API_URL}/bookings/changeBooking`, {
          bookingsToRemove,
          bookingsToAdd,
        })
        .pipe(
          catchError(error => {
            console.error('Error submitting bookings:', error);
            subject.error(error);
            return throwError(error);
          })
        )
        .subscribe(response => {
          this.bookingsToRemove.next([]);
          this.fetchAndUpdateBookings();
          subject.next(response);
          subject.complete();
        });

      return subject.asObservable();
    }
  }

  public changeBookings(
    oldBookings: IBooking[],
    newBookings: IBooking[]
  ): Observable<IResponse<IBooking[]> | IErrorResponse> {
    // add user data to bookings
    newBookings = this._addUserToBookings(newBookings);

    console.log('oldBookings', oldBookings);
    console.log('newBookings', newBookings);

    const subject = new Subject<IResponse<IBooking[]> | IErrorResponse>();

    this.http
      .post<IResponse<IBooking[]>>(`${this.API_URL}/bookings/changeBooking`, {
        oldBookings,
        newBookings,
      })
      .pipe(
        catchError(error => {
          console.error('Error changing bookings:', error);
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

  private _addUserToBookings(bookings: IBooking[]): IBooking[] {
    const name = this.authService.getName();
    const room = this.authService.getRoom();
    const house = this.authService.getHouse();

    // add user data to bookings
    bookings.forEach(booking => {
      // create bookedBy object
      booking.bookedBy = {
        name,
        room,
        house,
      };
    });
    return bookings;
  }
}
