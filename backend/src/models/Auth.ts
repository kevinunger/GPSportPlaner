import mongoose from 'mongoose';

import { ILoginData, IUserData, Role } from '../../../frontend/src/app/types/index';

const authSchema = new mongoose.Schema(
  {
    role: String,
    password: String,
  },
  {
    collection: 'auth',
  }
);

// compile to model
const Auth = mongoose.model('Auth', authSchema);

export { Auth, ILoginData, IUserData, Role };
