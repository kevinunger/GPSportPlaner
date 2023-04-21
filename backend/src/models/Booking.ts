import { Schema, model, connect } from "mongoose";

import { IBooking } from "../types/index";

const bookingsSchema = new Schema<IBooking>({
  start: Number,
  end: Number,
  bookedBy: String,
});

// compile to model
const Booking = model<IBooking>("Booking", bookingsSchema);

export { Booking, IBooking };
