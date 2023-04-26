import { Moment } from 'moment';
export interface IBooking {
  start: Moment;
  end: Moment;
  bookedBy: string;
}

export interface IResponse<T> {
  data: T | [];
  currentTime: Moment;
}

export interface IErrorResponse {
  error: string;
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export interface IAdmin {
  name: string;
  phoneNumber: string;
  assignedDay: Day;
  roomNumber: string;
  houseNumber: string;
  isAvailable: boolean;
}
