import { Schema, model, connect } from 'mongoose';

import { IBooking } from '../types/index';

const bookingsSchema = new Schema<IBooking>({
  start: String,
  end: String,
  bookedBy: String,
});

// compile to model
const Booking = model<IBooking>('Booking', bookingsSchema);

export { Booking, IBooking };
