import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingService } from 'src/app/services/booking.service';
import { IResponse, IBooking, IErrorResponse } from '../../types/index';
import { combineLatest } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  private bookings: IResponse<IBooking[]> = {
    data: [],
    currentTime: moment(0),
  };

  public timeSlots: IBooking[] = [];
  public selectedTimeSlots: IBooking[] = [];
  public userName: string = '';
  public successFullSumbission: boolean = false;
  public error: string = '';
  public userCanSubmit: boolean = false;
  public errorLabelText: string = 'Gib bitte deinen Namen ein!';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.fetchAndUpdateBookings().subscribe(
      () => {
        console.log('Bookings fetched and updated successfully');
      },
      error => {
        // Handle the error, e.g., show an error message to the user
        console.error('Error fetching and updating bookings:', error);
        this.error = error.message;
      }
    );

    this.bookingService.getBookings().subscribe(bookings => {
      console.log(bookings);
      this.bookings = bookings;
      this.timeSlots = this.createTimeSlots();
      console.log(bookings.currentTime);
    });

    combineLatest([this.bookingService.getSelectedBookingsByUser(), this.bookingService.getEnteredName()]).subscribe(
      ([timeslots, name]) => {
        this.selectedTimeSlots = timeslots;
        this.userName = name;

        if (timeslots.length === 0) {
          this.userCanSubmit = false;
          this.errorLabelText = 'Du musst mindestens eine Buchung wählen!';
        } else if (name.length === 0) {
          this.userCanSubmit = false;
          this.errorLabelText = 'Gib bitte deinen Namen ein!';
        } else {
          this.userCanSubmit = true;
        }
      }
    );
  }

  public onNameInput(event: any): void {
    if (event.target.value.length > 0) {
      this.userCanSubmit = true;
    } else {
      this.userCanSubmit = false;
    }

    this.bookingService.changeNameOfBookings(event.target.value);
    this.bookingService.setEnteredName(event.target.value);
  }

  public onSubmit(): void {
    const timeSlots = this.selectedTimeSlots;
    this.bookingService.submitBookings(timeSlots).subscribe(
      response => {
        this.bookingService.setSelectedBookingsByUser([]);
        this.bookingService.setConfirmedBookingsByUser(timeSlots);
        this.successFullSumbission = true;
      },
      (error: IErrorResponse) => {
        this.successFullSumbission = false;
        console.error(error);
      }
    );
  }

  // create time slots for the next 24 hours
  // if it's 16:05, the first time slot is 16:00 - 16:30 of the same day
  // the last time slot is 15.30 - 16:00 of the next day
  // if it's 16:05 the timeToStartFirstSlot is 16:00
  // if it's 16:29 the timeToStartFirstSlot is 16:00
  // if it's 16:30 the timeToStartFirstSlot is 16:30
  // if it's 16:35 the timeToStartFirstSlot is 16:30
  // if it's 16:49 the timeToStartFirstSlot is 16:30
  // if it's 17:01 the timeToStartFirstSlot is 17:00
  private createTimeSlots(): IBooking[] {
    const currentTime = this.bookings.currentTime;
    if (currentTime.valueOf() === 0) {
      return [];
    }

    // get the start of the current half hour
    // if it's 16:05 the timeToStartFirstSlot is 16:00
    // if it's 16:29 the timeToStartFirstSlot is 16:00
    // if it's 16:30 the timeToStartFirstSlot is 16:30
    // if it's 16:35 the timeToStartFirstSlot is 16:30

    let timeToStartFirstSlot: moment.Moment;
    if (currentTime.minute() < 30) {
      timeToStartFirstSlot = moment(currentTime).startOf('hour');
    } else {
      timeToStartFirstSlot = moment(currentTime).startOf('hour').add(30, 'minutes');
    }

    const timeSlots: IBooking[] = [];
    for (let i = 0; i < 48; i++) {
      const start = timeToStartFirstSlot.clone().add(i * 30, 'minutes');
      const end = start.clone().add(30, 'minutes');
      // console.log(start.format('HH:mm'), end.format('HH:mm'));

      // check if timeSlot is alrady booked by someone
      // check if there is a booking with the same start time
      const booking = this.bookings.data.find(booking => booking.start.isSame(start));
      timeSlots.push({
        start: start,
        end: end,
        bookedBy: booking?.bookedBy || '',
      });
    }
    return timeSlots;
  }
}
