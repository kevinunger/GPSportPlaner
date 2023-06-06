import { Component, OnInit, Input } from '@angular/core';
import { IResponse, IBooking, IErrorResponse } from '../../types/index';
import { BookingService } from '../../services/booking.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss'],
})
export class TimeslotComponent implements OnInit {
  @Input() timeslot: IBooking = {
    start: 0,
    end: 0,
    bookedBy: null,
  };
  start_formatted: string = ''; // HH:MM
  end_formatted: string = ''; // HH:MM
  day_formatted: string = ''; // DD MMM e.g. 14 Apr
  // event to parent component

  checked: boolean = false;
  disabledCheckbox: boolean = false;

  //check if timeslot is changeable (true if tokenUser == timeslot.bookedBy or user is master/admin)
  changeable: boolean = false;
  isMyBooking: boolean = false;

  @Input() isReadOnly: boolean = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.formatInputs();
    this.isMyBooking = this.checkIsMyBooking();
    if (this.timeslot.bookedBy && !this.isMyBooking) {
      this.disabledCheckbox = true;
    }

    if (this.isMyBooking) {
      this.checked = true;
    }
  }

  onCheck(): void {
    this.bookingService.addBooking(this.timeslot);
    this.checked = true;
  }

  onUncheck(): void {
    this.bookingService.removeBooking(this.timeslot);
    this.checked = false;
  }

  checkIsMyBooking(): boolean {
    // check if timeslot.bookedBy == tokenUser
    const tokenData = this.authService.getTokenData();
    if (!tokenData) return false;
    if (!this.timeslot.bookedBy) return false;
    return (
      tokenData.name === this.timeslot.bookedBy.name &&
      tokenData.room === this.timeslot.bookedBy.room &&
      tokenData.house === this.timeslot.bookedBy.house
    );
  }

  getBookingText(): string {
    if (this.timeslot.bookedBy) {
      return this.isMyBooking
        ? 'Gebucht von: Dir'
        : `Gebucht von: ${this.timeslot.bookedBy.name}`;
    }
    return '';
  }

  private formatInputs(): void {
    this.start_formatted = moment.unix(this.timeslot.start).format('HH:mm');
    this.end_formatted = moment.unix(this.timeslot.end).format('HH:mm');
    this.day_formatted = moment.unix(this.timeslot.start).format('DD MMM');
  }
}
