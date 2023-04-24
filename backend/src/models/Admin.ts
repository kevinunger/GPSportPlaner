import mongoose from 'mongoose';

import { IAdmin } from '../types/index';

const adminSchema = new mongoose.Schema({
  name: String,
  phone: String,
  isAvailable: Boolean,
  assignedDay: String,
});

// compile to model
const Admin = mongoose.model('Admin', adminSchema);

export { Admin, IAdmin };
