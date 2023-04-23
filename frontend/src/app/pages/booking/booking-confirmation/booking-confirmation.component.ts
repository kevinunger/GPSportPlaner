import { Component, OnInit, Input } from '@angular/core';
import { IResponse, IBooking, IErrorResponse } from '../../../types/index';
import * as moment from 'moment';
@Component({
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss'],
})
export class BookingConfirmationComponent implements OnInit {
  @Input() bookings: IBooking[] = [
    {
      start: moment('Sun Apr 23 2023 14:30:00 GMT+0200'),
      end: moment('Sun Apr 23 2023 15:00:00 GMT+0200'),
      bookedBy: 'ttes',
    },
    {
      start: moment('Sun Apr 23 2023 15:00:00 GMT+0200'),
      end: moment('Sun Apr 23 2023 15:30:00 GMT+0200'),
      bookedBy: 'ttes',
    },
  ];
  constructor() {}

  ngOnInit(): void {}
}
