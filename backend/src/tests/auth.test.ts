import { authenticate, getPasswordOfRole } from '../controllers/auth/index';
import { ILoginData } from '../models/Auth';
import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { Role } from '../../../frontend/src/app/types/index';

import { createUsers, user_password_hashed, admin_password_hashed, master_password_hashed } from './testHelpers';
import { invalid_token, valid_token_admin, valid_token_master, valid_token_user } from './testHelpers';
import { changePw } from '../controllers/auth';
import { app } from '../index';
import bcrypt from 'bcrypt';

import { expressjwt, ExpressJwtRequest } from 'express-jwt';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

const request = require('supertest');
import { Auth } from '../models/Auth';

beforeAll(async () => {
  await connectMongoTest();
  await createUsers();
  // Set up users with their passwords
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest(['auth']);
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

describe('testHelpers testing', () => {
  test('test hashed PWs', async () => {
    const user_password_hashed = bcrypt.hashSync('user_password', 10);
    const admin_password_hashed = bcrypt.hashSync('admin_password', 10);
    const master_password_hashed = bcrypt.hashSync('master_password', 10);
    expect(await bcrypt.compare('user_password', user_password_hashed)).toBe(true);
    expect(await bcrypt.compare('admin_password', admin_password_hashed)).toBe(true);
    expect(await bcrypt.compare('master_password', master_password_hashed)).toBe(true);
  });
  test('check if roles are in db', async () => {
    const user = await Auth.find({ role: 'user' });
    const admin = await Auth.find({ role: 'admin' });
    const master = await Auth.find({ role: 'master' });

    expect(user.length).toBeGreaterThan(0);
    expect(admin.length).toBeGreaterThan(0);
    expect(master.length).toBeGreaterThan(0);
  });
});
describe('Login tests', () => {
  test('login as user', async () => {
    const loginData: ILoginData = {
      name: 'Test User',
      house: '9',
      room: '123',
      password: 'user_password',
    };
    const token = await authenticate(loginData);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    expect(decoded.name).toBe(loginData.name);
    expect(decoded.house).toBe(loginData.house);
    expect(decoded.room).toBe(loginData.room);
    expect(decoded.role).toBe('user');
  });
  test('authenticate should throw an error for invalid login data', async () => {
    const loginData: ILoginData = {
      name: 'Test User',
      house: '9',
      room: '123',
      password: 'invalid_password',
    };

    await expect(authenticate(loginData)).rejects.toThrow('Invalid password');
  });

  describe('changePw tests', () => {
    test('changePw should change the password of the specified role', async () => {
      const oldPassword = 'admin_password';
      const newPassword = 'new_admin_password';
      const role = Role.Admin;

      await changePw(oldPassword, newPassword, role);
      const updatedPassword = await getPasswordOfRole(role);
      const loginData: ILoginData = {
        name: 'Test Admin',
        house: '9',
        room: '123',
        password: newPassword,
      };

      const token = await authenticate(loginData);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
    test('changePw should throw an error if the old password is incorrect', async () => {
      const oldPassword = 'incorrect_password';
      const newPassword = 'new_admin_password';
      const role = Role.Admin;

      await expect(changePw(oldPassword, newPassword, role)).rejects.toThrow('Invalid oldPassword');
    });
    test('changePw should throw an error if the role is invalid', async () => {
      const oldPassword = 'admin_password';
      const newPassword = 'new_admin_password';
      const role = 'invalid_role' as Role;

      await expect(changePw(oldPassword, newPassword, role)).rejects.toThrow('Invalid role');
    });
  });

  describe('auth middleware tests', () => {
    test('auth middleware should throw an error if no token is provided', async () => {
      const res = await request(app).get('/bookings/getCurrentBookings');
      expect(res.status).toBe(401);
    });
    test('auth middleware should throw an error if the token is invalid', async () => {
      // generate jwt with some secret
      const invalid_token = jwt.sign(
        {
          name: 'Test Admin',
          house: '9',
          room: '123',
          role: Role.Admin,
        },
        'wrong secret',
        {
          expiresIn: '2w',
        }
      );

      // request with auth header
      const res = await request(app)
        .get('/bookings/getCurrentBookings')
        .set('Authorization', `Bearer ${invalid_token}`);
      expect(res.status).toBe(401);
    });
    test('auth middleware should throw an error if the token is expired', async () => {
      // generate jwt with some secret
      const expired_token = jwt.sign(
        {
          name: 'Test Admin',
          house: '9',
          room: '123',
          role: Role.Admin,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '0s',
        }
      );

      // request with auth header
      const res = await request(app).post('/auth/changePW').set('Authorization', `Bearer ${expired_token}`);
      expect(res.status).toBe(401);
    });
    test('auth middleware should return 200 if the token is valid', async () => {
      // generate jwt with some secret
      const valid_token = await jwt.sign(
        {
          name: 'Test Admin',
          house: '9',
          room: '123',
          role: Role.User,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '2w',
        }
      );

      // request with auth header
      const res = await request(app).get('/bookings/getCurrentBookings').set('Authorization', `Bearer ${valid_token}`);
      expect(res.status).toBe(200);
    });
  });
  // });

  // test('changePw should change the password of the specified role', async () => {
  //   const oldPassword = 'admin_password';
  //   const newPassword = 'new_admin_password';
  //   const role = Role.Admin;

  //   await changePw(oldPassword, newPassword, role);
  //   const updatedPassword = await getPasswordOfRole(role);
  //   const loginData: ILoginData = {
  //     house: '9',
  //     room: '123',
  //     password: newPassword,
  //   };

  //   const token = await authenticate(loginData);
  //   expect(typeof token).toBe('string');
  //   expect(token.length).toBeGreaterThan(0);
  // });

  // test('changePw should throw an error if the old password is incorrect', async () => {
  //   const oldPassword = 'incorrect_password';
  //   const newPassword = 'new_admin_password';
  //   const role = Role.Admin;

  //   await expect(changePw(oldPassword, newPassword, role)).rejects.toThrow('Invalid oldPassword');
  // });

  // // Add more tests as needed
});
