import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { IResponse, IBooking, IErrorResponse } from '../../types/index';
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
    currentTime: 0,
  };
  public selectedDate: moment.Moment = moment();
  public selectedDateFormatted: string = this.selectedDate.format('DD MMM');
  public selectedDateIsCurrentDay: boolean = true;

  public timeSlots: IBooking[] = [];
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.fetchAndUpdateBookingsByDate(this.selectedDate).subscribe(
      () => {
        this.bookingService.getBookings().subscribe(bookings => {
          this.bookings = bookings;
          this.timeSlots = this.createTimeSlots();
        });
      },
      (error: IErrorResponse) => {
        console.error('Error fetching and updating bookings:', error);
      }
    );
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
    this.bookingService.fetchAndUpdateBookingsByDate(this.selectedDate).subscribe();

    // check if this.selectedDate is the current day
    this.selectedDateIsCurrentDay = this.selectedDate.isSame(moment(), 'day');
  }

  //first time slot starts at 0:00
  // last ends at 24:00
  private createTimeSlots(): IBooking[] {
    const currentTime = this.selectedDate;
    if (currentTime.unix() === 0) {
      return [];
    }

    let timeToStartFirstSlot: moment.Moment;
    timeToStartFirstSlot = currentTime.startOf('day');
    console.log(timeToStartFirstSlot.format('HH:mm'));

    const timeSlots: IBooking[] = [];
    for (let i = 0; i < 48; i++) {
      const start = timeToStartFirstSlot.clone().add(i * 30, 'minutes');
      const end = start.clone().add(30, 'minutes');
      // console.log(start.format('HH:mm'), end.format('HH:mm'));

      // check if timeSlot is alrady booked by someone
      // check if there is a booking with the same start time
      const booking = this.bookings.data.find(booking => moment.unix(booking.start).isSame(start));
      timeSlots.push({
        start: start.unix(),
        end: end.unix(),
        bookedBy: booking?.bookedBy || null,
      });
    }
    return timeSlots;
  }
}
