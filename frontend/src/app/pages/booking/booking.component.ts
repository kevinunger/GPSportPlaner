import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { AuthService } from 'src/app/services/auth.service';
import { BookingService } from 'src/app/services/booking.service';
import { IBooking, IResponse } from '../../types/index';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  private bookings: IResponse<IBooking[]> = {
    data: [],
    currentTime: 0,
  };

  public timeSlots: IBooking[] = [];
  public selectedTimeSlots: IBooking[] = [];
  public userName: string = '';
  public successFullSumbission: boolean = false;
  public error: string = '';
  public userCanSubmit: boolean = false;
  public errorLabelText: string = 'Gib bitte deinen Namen ein!';

  constructor(
    private adminService: AdminService,
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminService.fetchAndSetAdmins().subscribe(
      () => {
        console.log('Admins fetched and updated successfully');
      },
      error => {
        console.error('Error fetching and updating admins:', error);
        this.error = error.message;
      }
    );
    this.bookingService.fetchAndUpdateBookings().subscribe(
      () => {
        console.log('Bookings fetched and updated successfully');
      },
      error => {
        console.error('Error fetching and updating bookings:', error);
        this.error = error.message;
      }
    );

    this.bookingService.getBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.timeSlots = this.createTimeSlots();
    });

    this.bookingService.getSelectedBookingsByUser().subscribe(timeslots => {
      this.selectedTimeSlots = timeslots;
      this.userName = this.authService.getName();

      if (timeslots.length === 0) {
        this.userCanSubmit = false;
        this.errorLabelText = 'Du musst mindestens eine Buchung wählen!';
      } else if (this.userName.length === 0) {
        this.userCanSubmit = false;
        this.errorLabelText = 'Gib bitte deinen Namen ein!';
      } else {
        this.userCanSubmit = true;
      }
    });
  }

  public onSubmit(): void {
    const timeSlots = this.selectedTimeSlots;
    this.bookingService.submitBookings(timeSlots).subscribe(
      response => {
        this.bookingService.setSelectedBookingsByUser([]);
        this.bookingService.setConfirmedBookingsByUser(timeSlots);
        this.successFullSumbission = true;
      },
      (error: HttpErrorResponse) => {
        this.successFullSumbission = false;
        console.error(error);
        console.log(error);
        this.errorLabelText = error.error.error;
        this.userCanSubmit = false;
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
    const currentTime = moment.unix(this.bookings.currentTime);
    if (currentTime.unix() === 0) {
      return [];
    }

    console.log(this.bookings.currentTime);

    // get the start of the current half hour
    // if it's 16:05 the timeToStartFirstSlot is 16:00
    // if it's 16:29 the timeToStartFirstSlot is 16:00
    // if it's 16:30 the timeToStartFirstSlot is 16:30
    // if it's 16:35 the timeToStartFirstSlot is 16:30

    let timeToStartFirstSlot: moment.Moment;
    if (currentTime.minute() < 30) {
      timeToStartFirstSlot = currentTime.startOf('hour');
    } else {
      timeToStartFirstSlot = currentTime.startOf('hour').add(30, 'minutes');
    }

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
        bookedBy: booking?.bookedBy || '',
      });
    }
    return timeSlots;
  }
}
