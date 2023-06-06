export interface IBooking {
  start: number;
  end: number;
  bookedBy: IUser | null;
}

export interface IResponse<T> {
  data: T;
  currentTime: number;
}

export interface IErrorResponse {
  error: string;
}

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';
export interface IAdmin {
  name: string;
  phoneNumber: string;
  assignedDay: Day;
  roomNumber: string;
  houseNumber: string;
  isAvailable: boolean;
}

//enum roles
export enum Role {
  User = 'user',
  Admin = 'admin',
  Master = 'master',
}

export interface IUser {
  name: string;
  house: string;
  room: string;
}

export interface TokenPayload extends IUser {
  role: Role;
  iat: number;
  exp: number;
}
export interface ILoginData extends IUser {
  password: string;
  role?: Role;
}
