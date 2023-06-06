import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IResponse, IBooking, IErrorResponse, IAdmin } from '../../../types/index';
import { BookingService } from '../../../services/booking.service';
import { AdminService } from 'src/app/services/admin.service';
import * as moment from 'moment';

/*
 * This component is used to display the selected bookings of the user on the booking confirmation page.
 * It also shows the responsible admins for that day.
 * If the user has just deleted bookings, it should reflect that
 * and show the user that he just deleted these bookings.
 */

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
  formattedBookings: FormattedBookings[] = [];
  bookings: IBooking[] = [];
  adminsOfDays: IAdmin[][] = [];
  justDeletedBookings: boolean = false;
  titleText: string = 'Du bist eingetragen!';

  constructor(private bookingService: BookingService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.bookingService.getConfirmedBookingsByUser().subscribe((response: IBooking[]) => {
      this.formatBookings(response);
      this.bookings = response;
      if (this.bookings.length === 0) {
        this.justDeletedBookings = true;
        this.titleText = 'Eintragungen wurden gelöscht!';
      }
    });

    this.adminService.getAdmins().subscribe((admins: IAdmin[]) => {
      // get the day of bookings (one day if bookings are on the same day)
      let days: string[] = [];
      this.bookings.map((booking: IBooking) => {
        let day1 = moment.unix(booking.start).format('dddd');
        let day2 = moment.unix(booking.end).format('dddd');
        if (!days.includes(day1)) days.push(day1);
        if (!days.includes(day2)) days.push(day2);
      });
      // get all admins of days
      this.adminsOfDays = [];
      days.map((day: string) => {
        let adminsOfDay: IAdmin[] = [];
        admins.map((admin: IAdmin) => {
          if (admin.assignedDay.includes(day)) adminsOfDay.push(admin);
        });
        this.adminsOfDays.push(adminsOfDay);
      });
      let isEmpty: boolean = true;
      this.adminsOfDays.forEach((admins: IAdmin[]) => {
        if (admins.length !== 0) isEmpty = false;
      });
      if (isEmpty) this.adminsOfDays = [];
    });
  }

  formatBookings(bookings: IBooking[]): void {
    this.formattedBookings = bookings.map((booking: IBooking) => {
      return {
        start: moment.unix(booking.start).format('HH:mm').toString(),
        end: moment.unix(booking.end).format('HH:mm').toString(),
        startx: moment.unix(booking.start).format('MMM DD (dddd)').toString(),
      };
    });
  }
}
