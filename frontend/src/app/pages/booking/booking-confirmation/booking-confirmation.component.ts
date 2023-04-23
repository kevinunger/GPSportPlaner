import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IResponse, IBooking, IErrorResponse } from '../../../types/index';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
})
export class BookingConfirmationComponent implements OnInit {
  bookings: IBooking[] = [];
  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getConfirmedBookingsByUser().subscribe((response: IBooking[]) => {
      this.bookings = response;
      console.log(response);
      console.log(response);
      console.log(response);
      console.log(response);
    });
  }
}
