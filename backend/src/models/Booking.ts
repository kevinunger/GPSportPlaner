import mongoose from "mongoose";

const bookingsSchema = new mongoose.Schema({
  start: String,
  end: String,
  bookedBy: String,
});

// compile to model
const Booking = mongoose.model("Booking", bookingsSchema);

export default Booking;
