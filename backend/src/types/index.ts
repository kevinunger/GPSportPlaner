import { Moment } from 'moment';
import { Document, Types } from 'mongoose';

export interface IBooking {
  start: Moment;
  end: Moment;
  bookedBy: string;
}

export interface IAdmin {
  name: string;
  phoneNumber: string;
  assignedDay: string;
  roomNumber: string;
  houseNumber: string;
  isAvailable: boolean;
}

export interface IResponse<T> {
  data: T | [];
  currentTime: Moment;
}

export interface IErrorResponse {
  error: string;
}
