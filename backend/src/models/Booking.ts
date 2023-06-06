import { Schema, model, connect, Model } from 'mongoose';

import { IBooking } from '../../../frontend/src/app/types/index';

interface IBookingDocument extends IBooking, Document {}
// interface IBookingModel extends Model<IBookingDocument> {}

const bookingsSchema = new Schema<IBookingDocument>({
  start: Number,
  end: Number,
  bookedBy: {
    name: String,
    house: String,
    room: String,
  },
});

// compile to model
const Booking = model<IBookingDocument>('Booking', bookingsSchema);

export { Booking, IBooking };
