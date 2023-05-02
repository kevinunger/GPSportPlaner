import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IResponse, IBooking, IErrorResponse } from '../../../types/index';
import { BookingService } from '../../../services/booking.service';
import * as moment from 'moment';

interface FormattedBookings {
  start: string;
  end: string;
  startx: string;
}
[];

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
})
export class BookingConfirmationComponent implements OnInit {
  bookings: IBooking[] = [];
  formattedBookings: FormattedBookings[] = [];
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getConfirmedBookingsByUser().subscribe((response: IBooking[]) => {
      this.bookings = response;
    });
  }

  formatBookings(): void {
    this.formattedBookings = this.bookings.map((booking: IBooking) => {
      return {
        start: moment.unix(booking.start).format('HH:mm').toString(),
        end: moment.unix(booking.end).format('HH:mm').toString(),
        startx: moment.unix(booking.start).format('MMM DD (dddd)').toString(),
      };
    });
  }
}
