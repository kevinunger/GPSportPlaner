import mongoose from 'mongoose';

import { IAdmin, IResponse, IErrorResponse, IBooking } from '../../../frontend/src/app/types/index';

const adminSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  isAvailable: Boolean,
  assignedDay: String,
  roomNumber: String,
  houseNumber: String,
});

// compile to model
const Admin = mongoose.model('Admin', adminSchema);

export { Admin, IAdmin };
