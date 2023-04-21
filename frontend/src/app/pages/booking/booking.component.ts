import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { IResponse, IBooking } from '../../../../../backend/src/types/index';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  private bookings: IResponse<IBooking[]> = {
    data: [],
    currentTime: 0,
    currentTimeZoneOffset: 0,
  };
  public timeSlots: IBooking[] = [];
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.fetchAndUpdateBookings();

    this.bookingService.getBookings().subscribe(bookings => {
      console.log(bookings);
      this.bookings = bookings;
      this.timeSlots = this.createTimeSlots(bookings.currentTime);
      console.log(bookings.currentTime);
      console.log(bookings.currentTimeZoneOffset);
    });
  }

  // create time slots for the next 24 hours
  // if it's 16:05, the first time slot is 16:00 - 16:30 of the same day
  // the last time slot is 15.30 - 16:00 of the next day
  // if it's 16:05 the timeToStartFirstSlot is 16:00
  // if it's 16:29 the timeToStartFirstSlot is 16:00
  // if it's 16:30 the timeToStartFirstSlot is 16:30
  // if it's 16:35 the timeToStartFirstSlot is 16:30
  // if it's 16:49 the timeToStartFirstSlot is 16:30
  // if it's 17:01 the timeToStartFirstSlot is 17:00
  private createTimeSlots(currentTime: number): IBooking[] {
    if (currentTime === 0) {
      return [];
    }

    const MILLISECONDS_IN_MINUTE = 60 * 1000;
    const MILLISECONDS_IN_HALF_HOUR = 30 * MILLISECONDS_IN_MINUTE;

    const timeToStartFirstSlot = Math.floor(currentTime / MILLISECONDS_IN_HALF_HOUR) * MILLISECONDS_IN_HALF_HOUR;
    console.log(new Date(currentTime));
    console.log(new Date(timeToStartFirstSlot));

    const timeSlots: IBooking[] = [];
    for (let i = 0; i < 48; i++) {
      const start = timeToStartFirstSlot + i * MILLISECONDS_IN_HALF_HOUR;
      const end = start + MILLISECONDS_IN_HALF_HOUR;
      timeSlots.push({
        start,
        end,
        bookedBy: '',
      });
    }
    return timeSlots;
  }
}
