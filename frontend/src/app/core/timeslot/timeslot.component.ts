import { Component, OnInit, Input } from '@angular/core';
import { IResponse, IBooking } from '../../../../../backend/src/types/index';

@Component({
  selector: 'app-timeslot',
  templateUrl: './timeslot.component.html',
  styleUrls: ['./timeslot.component.scss'],
})
export class TimeslotComponent implements OnInit {
  @Input() timeslot: IBooking = {
    start: 0,
    end: 0,
    bookedBy: '',
  };
  start_formatted: string = ''; // HH:MM
  end_formatted: string = ''; // HH:MM
  day_formatted: string = ''; // DD MMM e.g. 14 Apr
  constructor() {}

  ngOnInit(): void {
    this.formatInputs();
  }

  ngOnChanges(): void {
    this.formatInputs();
  }

  private formatInputs(): void {
    this.start_formatted = this.formatTime(this.timeslot.start);
    this.end_formatted = this.formatTime(this.timeslot.end);
    this.day_formatted = this.formatDay(this.timeslot.start);
  }

  private formatTime(time: number): string {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatDay(time: number): string {
    const date = new Date(time);
    const day = date.getDate();
    const month = date.getMonth();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month]}`;
  }
}
