export interface IBooking {
  start: number;
  end: number;
  bookedBy: string;
}

export interface IResponse<T> {
  data: T | [];
  currentTime: number;
  currentTimeZoneOffset: number;
}

export interface IErrorResponse {
  error: string;
}
