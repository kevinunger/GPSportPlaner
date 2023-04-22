import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { IResponse, IBooking } from '../../../../../backend/src/types/index';

@Component({
  selector: 'app-booking-overview',
  templateUrl: './booking-overview.component.html',
  styleUrls: ['./booking-overview.component.scss'],
})
export class BookingOverviewComponent implements OnInit {
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
      // use bookings.currentTime and bookings.currentTimeZoneOffset to calculate the current time
      const currentTime = bookings.currentTime + bookings.currentTimeZoneOffset;
      this.timeSlots = this.createTimeSlots(currentTime);
      console.log(bookings.currentTime);
      console.log(bookings.currentTimeZoneOffset);
    });
  }

  //first time slot starts at 0:00
  // last ends at 24:00
  private createTimeSlots(currentTime: number): IBooking[] {
    if (currentTime === 0) {
      return [];
    }

    const MILLISECONDS_IN_MINUTE = 60 * 1000;
    const MILLISECONDS_IN_HALF_HOUR = 30 * MILLISECONDS_IN_MINUTE;

    const startTimeOfDay = new Date(currentTime).setHours(0, 0, 0, 0);

    const timeSlots: IBooking[] = [];
    for (let i = 0; i < 48; i++) {
      const start = startTimeOfDay + i * MILLISECONDS_IN_HALF_HOUR;
      const end = start + MILLISECONDS_IN_HALF_HOUR;

      // check if timeSlot is alrady booked by someone
      // check if there is a booking with the same start time
      const booking = this.bookings.data.find(booking => booking.start === start);
      timeSlots.push({
        start,
        end,
        bookedBy: booking?.bookedBy || '',
      });
    }
    return timeSlots;
  }
}
