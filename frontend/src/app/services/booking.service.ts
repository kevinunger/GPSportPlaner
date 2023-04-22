import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResponse, IBooking, IErrorResponse } from '../../../../backend/src/types/index';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
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
    bookings.sort((a, b) => a.start - b.start);
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

  public fetchAndUpdateBookings() {
    console.log('fetchAndUpdateBookings');
    console.log(this.API_URL);
    this.http.get<IResponse<IBooking[]>>(`${this.API_URL}/bookings/getCurrentBookings`).subscribe(response => {
      this.bookings.next(response);
      console.log(response.data);
    });
  }

  public async submitBookings(bookings: IBooking[]): Promise<Observable<IResponse<IBooking[]> | IErrorResponse>> {
    console.log('submitBookings');
    console.log(bookings);
    var subject = new Subject<IResponse<IBooking[]> | IErrorResponse>();
    await this.http.post<IResponse<IBooking[]>>(`${this.API_URL}/bookings/addBooking`, bookings).subscribe(response => {
      console.log(response);
      this.bookings.next(response);
      subject.next(response);
      return response;
    });
    return subject.asObservable();
  }
}
