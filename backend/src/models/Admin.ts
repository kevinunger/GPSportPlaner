import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: String,
  phone: String,
  isAvailable: Boolean,
});

// compile to model
const Admin = mongoose.model("Booking", adminSchema);

export default Admin;
