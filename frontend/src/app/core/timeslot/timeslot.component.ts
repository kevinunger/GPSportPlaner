import { Component, OnInit, Input } from '@angular/core';
import { IResponse, IBooking, IErrorResponse } from '../../types/index';
import { BookingService } from '../../services/booking.service';
import * as moment from 'moment';
@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss'],
})
export class TimeslotComponent implements OnInit {
  @Input() timeslot: IBooking = {
    start: moment(0),
    end: moment(0),
    bookedBy: '',
  };
  start_formatted: string = ''; // HH:MM
  end_formatted: string = ''; // HH:MM
  day_formatted: string = ''; // DD MMM e.g. 14 Apr
  // event to parent component

  checked: boolean = false;
  disabled: boolean = false;

  @Input() isReadOnly: boolean = false;

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    // this.formatInputs();
  }

  ngOnChanges(): void {
    this.formatInputs();
    this.disabled = this.timeslot.bookedBy !== '';
  }

  onCheck(): void {
    console.log('checked checkbox');
    console.log(this.timeslot.start.format('HH mm'), this.timeslot.end.format('HH mm'), this.timeslot.bookedBy);
    this.bookingService.addBooking(this.timeslot);
    this.checked = true;
  }
  onUncheck(): void {
    console.log('unchecked checkbox');
    console.log(this.timeslot.start.format('HH mm'), this.timeslot.end.format('HH mm'), this.timeslot.bookedBy);
    this.bookingService.removeBooking(this.timeslot);
    this.checked = false;
  }

  private formatInputs(): void {
    this.start_formatted = this.timeslot.start.format('HH:mm');
    this.end_formatted = this.timeslot.end.format('HH:mm');
    this.day_formatted = this.timeslot.start.format('DD MMM');
  }
}
