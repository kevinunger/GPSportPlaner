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
