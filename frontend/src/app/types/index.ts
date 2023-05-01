export interface IBooking {
  start: number;
  end: number;
  bookedBy: string;
}

export interface IResponse<T> {
  data: T;
  currentTime: number;
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

export interface ILoginData {
  name: string;
  house: string;
  room: string;
  password: string;
}

//enum roles
export enum Role {
  User = 'user',
  Admin = 'admin',
  Master = 'master',
}

export interface ILoginData {
  name: string;
  house: string;
  room: string;
  password: string;
  role?: Role;
}

export interface IUserData {
  role: string;
  expDate: number;
}
