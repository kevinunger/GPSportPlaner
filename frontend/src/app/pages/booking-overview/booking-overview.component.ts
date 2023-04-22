import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { IResponse, IBooking } from '../../../../../backend/src/types/index';
import * as moment from 'moment';
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-booking-overview',
  templateUrl: './booking-overview.component.html',
  styleUrls: ['./booking-overview.component.scss'],
})
export class BookingOverviewComponent implements OnInit {
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  private bookings: IResponse<IBooking[]> = {
    data: [],
    currentTime: moment(0),
  };
  public selectedDate: moment.Moment = moment();
  public selectedDateFormatted: string = this.selectedDate.format('DD MMM');

  public timeSlots: IBooking[] = [];
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.fetchAndUpdateBookingsByDate(this.selectedDate);

    this.bookingService.getBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.createTimeSlots();
    });
  }

  public onDateChange(direction: 'next' | 'previous') {
    if (direction === 'next') {
      this.selectedDate.add(1, 'day');
    } else {
      this.selectedDate.subtract(1, 'day');
    }
    this.selectedDateFormatted = this.selectedDate.format('DD MMM');
    // to string
    this.selectedDate.toString();
    console.log(this.selectedDate.toString());
    this.bookingService.fetchAndUpdateBookingsByDate(this.selectedDate);
  }

  //first time slot starts at 0:00
  // last ends at 24:00
  private createTimeSlots(): void {
    const currentTime = this.selectedDate;
    if (currentTime.valueOf() === 0) {
      return;
    }
    this.timeSlots = [];
    console.log('currentTime object:', currentTime);

    console.log(currentTime.valueOf());
    console.log(currentTime.minutes());

    const MILLISECONDS_IN_MINUTE = 60 * 1000;
    const MILLISECONDS_IN_HALF_HOUR = 30 * MILLISECONDS_IN_MINUTE;

    const startTimeOfDay = currentTime.startOf('day');

    for (let i = 0; i < 48; i++) {
      const start = startTimeOfDay.valueOf() + i * MILLISECONDS_IN_HALF_HOUR;
      const end = start + MILLISECONDS_IN_HALF_HOUR;

      // check if timeSlot is alrady booked by someone
      // check if there is a booking with the same start time
      const booking = this.bookings.data.find(booking => booking.start.isSame(start));
      this.timeSlots.push({
        start: moment(start),
        end: moment(end),
        bookedBy: booking?.bookedBy || '',
      });
    }
  }
}
