import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { Booking } from '../models/Booking';
import {
  getGermanLocalTime,
  deleteAllBookings,
  addBooking,
  getCurrentBookings,
  getBookingsOfDay,
} from '../controllers/bookings';
import moment, { Moment } from 'moment-timezone';

const request = require('supertest');
import { app } from '../index';
import bcrypt from 'bcrypt';
import {
  createUsers,
  invalid_token,
  valid_token_admin,
  valid_token_master,
  valid_token_user,
} from './testHelpers';
const user_password_hashed = bcrypt.hashSync('user_password', 10);
const admin_password_hashed = bcrypt.hashSync('admin_password', 10);
const master_password_hashed = bcrypt.hashSync('master_password', 10);

beforeAll(async () => {
  console.log('env: ', process.env.NODE_ENV);
  await connectMongoTest();
  await createUsers();
  // Set up users with their passwords
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

const login = async () => {
  const response = await request(app).post('/login').send({
    name: 'kevin',
    house: '9',
    room: '0607',
    password: 'master_password_hashed',
  });
  return response.body.data;
};

describe('Timing Tests', () => {
  it('test current time', done => {
    const currentTime = moment();
    expect(currentTime.valueOf()).toBeGreaterThan(0);
    done();
  });
});

describe('Add Bookings Tests', () => {
  it('add a booking', async () => {
    const startTime = moment.unix(1682172000); // Sat 04 22 2023 16:', 'MM DD YYYY HH:mm:ss
    const sampleBookings = [
      {
        start: startTime.clone().unix(),
        end: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        end: startTime
          .clone()
          .add(moment.duration(30, 'minutes'))
          .add(moment.duration(30, 'minutes'))
          .unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
    ];
    const currentTime = moment().unix();
    const savedBooking = await addBooking(sampleBookings, currentTime);
    expect(savedBooking).not.toBeNull();

    // check if savedBooking is in db
    for (const booking of sampleBookings) {
      const bookings = await Booking.find({
        start: booking.start,
        end: booking.end,
        bookedBy: booking.bookedBy,
      });
      expect(bookings.length).toBe(1);
    }
  });

  it('add a booking at the wrong time', async () => {
    let currentTime = moment('04 22 2023 10:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const endTime = moment('04 23 2023 16:30:00', 'MM DD YYYY HH:mm:ss').unix();

    const sampleBookings = [
      {
        start: startTime,
        end: endTime,
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
    ];

    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'End of last booking is more than 24 hours from now'
    );

    // check what happens if current time is EXACTLY 24 hours after end
    // this should fail as well
    currentTime = moment('04 22 2023 16:30:00', 'MM DD YYYY HH:mm:ss ').unix();
    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'End of last booking is more than 24 hours from now'
    );

    // check what happens if current time is one second after the 24 hour limit
    // this should succeed
    const savedBooking = await addBooking(sampleBookings, currentTime + 1);
    expect(savedBooking).not.toBeNull();
  });

  it('add a more than 4 bookings', async () => {
    let currentTime = moment('Sat 04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('Sat 04 22 2023 15:30:00', 'MM DD YYYY HH:mm:ss');
    const sampleBookings = [
      {
        start: startTime.clone().unix(),
        end: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime
          .clone()
          .add(moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        end: startTime
          .clone()
          .add(2 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime
          .clone()
          .add(2 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        end: startTime
          .clone()
          .add(3 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime
          .clone()
          .add(3 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        end: startTime
          .clone()
          .add(4 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime
          .clone()
          .add(4 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        end: startTime
          .clone()
          .add(5 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds')
          .unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
    ];

    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'You can only book max. 4 bookings at a time'
    );
  });
  it('add a booking that overlaps with another booking', async () => {
    const currentTime = moment('Sat 04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('Sat 04 22 2023 10:00:00', 'MM DD YYYY HH:mm:ss');
    const sampleBookings = [
      {
        start: startTime.clone().unix(),
        end: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        end: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
    ];
    await addBooking(sampleBookings, currentTime);

    // add a booking that overlaps with the first booking
    const overlappingBooking = {
      start: startTime.clone().unix(),
      end: startTime.clone().add(moment.duration(30, 'minutes')).unix(),
      bookedBy: {
        name: 'Kevin',
        house: '9',
        room: '0607',
      },
    };
    await expect(addBooking([overlappingBooking], currentTime)).rejects.toThrow(
      `Booking already exists ${startTime.clone().unix()} - ${startTime
        .clone()
        .add(moment.duration(30, 'minutes'))
        .unix()} by Kevin`
    );
  });
  it('add bookings to different dates and check if they are retrieved correctly', async () => {
    const currentTime = moment('Sat 04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('Sat 04 22 2023 10:00:00', 'MM DD YYYY HH:mm:ss');
    const bookingsToday = [
      {
        start: startTime.clone().unix(), // 10:00
        end: startTime.clone().add(moment.duration(30, 'minutes')).unix(), // 10:30
        bookedBy: {
          name: 'KevinToday',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')).unix(), // 11:30
        end: startTime.clone().add(moment.duration(60, 'minutes')).unix(), // 12:00
        bookedBy: {
          name: 'KevinToday',
          house: '9',
          room: '0607',
        },
      },
    ];
    const res = await addBooking(bookingsToday, currentTime);
    //this should work
    expect(res).not.toBeNull();
    //check if getBookingsOfDay() returns the correct bookings
    const bookingsTodayRetrieved = (await getBookingsOfDay(startTime)).length;
    expect(bookingsTodayRetrieved).toEqual(bookingsToday.length);

    const startTimeTomorrow = moment('Sat 04 23 2023 10:00:00', 'MM DD YYYY HH:mm:ss');
    const bookingsTomorrow = [
      {
        start: startTimeTomorrow.clone().unix(), // 10:00
        end: startTimeTomorrow.clone().add(moment.duration(30, 'minutes')).unix(), // 10:30
        bookedBy: {
          name: 'KevinTomorrow',
          house: '9',
          room: '0607',
        },
      },
    ];
    const res1 = await addBooking(bookingsTomorrow, currentTime);
    //this should work
    expect(res1).not.toBeNull();

    const bookingsTomorrowRetrieved = await getBookingsOfDay(startTimeTomorrow);
    expect(bookingsTomorrowRetrieved.length).toEqual(bookingsTomorrow.length);
  });
  it('add two similar bookings and see if 2nd one is rejected', async () => {
    const currentTime = moment('04 23 2023 15:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('04 23 2023 23:30:00', 'MM DD YYYY HH:mm:ss');
    const endTime = moment('04 24 2023 00:00:00 ', 'MM DD YYYY HH:mm:ss');
    const sampleBooking1 = [
      {
        start: startTime.clone().unix(),
        end: endTime.clone().unix(),
        bookedBy: {
          name: 'Kevin1',
          house: '9',
          room: '0607',
        },
      },
    ];
    const sampleBooking2 = [
      {
        start: startTime.clone().unix(),
        end: endTime.clone().unix(),
        bookedBy: {
          name: 'Kevin2',
          house: '9',
          room: '0607',
        },
      },
    ];
    await addBooking(sampleBooking1, currentTime);
    await expect(addBooking(sampleBooking2, currentTime)).rejects.toThrow(
      `Booking already exists ${startTime.clone().unix()} - ${endTime.clone().unix()} by Kevin1`
    );
  });
  it('Check if bookings are retrieved correctly', async () => {
    // create multiple bookings

    const startTime = moment('Sun 04 23 2023 14:00:00', 'MM DD YYYY HH:mm:ss');
    const sampleBooking1 = [
      {
        start: startTime.clone().unix(), // 14:00
        end: startTime.clone().add(30, 'minutes').unix(), // 14:30
        bookedBy: {
          name: 'Kevin1',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime.clone().add(30, 'minutes').unix(), // 14:30
        end: startTime.clone().add(60, 'minutes').unix(), // 15:00
        bookedBy: {
          name: 'Kevin1',
          house: '9',
          room: '0607',
        },
      },
    ];
    const startTime2 = moment('Sun 04 23 2023 23:30:00', 'MM DD YYYY HH:mm:ss');
    const sampleBooking2 = [
      {
        start: startTime2.clone().unix(), // 23:30
        end: startTime2.clone().add(30, 'minutes').unix(), // ', 'MM DD YYYY HH:mm:ss
        bookedBy: {
          name: 'Kevin2',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime2.clone().add(30, 'minutes').unix(), // ', 'MM DD YYYY HH:mm:ss
        end: startTime2.clone().add(60, 'minutes').unix(), // 00:30
        bookedBy: {
          name: 'Kevin2',
          house: '9',
          room: '0607',
        },
      },
    ];
    const startTime3 = moment('Sun 04 24 2023 14:00:00', 'MM DD YYYY HH:mm:ss');
    const sampleBooking3 = [
      {
        start: startTime3.clone().unix(), // 14:00
        end: startTime3.clone().add(30, 'minutes').unix(), // 14:30
        bookedBy: {
          name: 'Kevin3',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime3.clone().add(30, 'minutes').unix(), // 14:30
        end: startTime3.clone().add(60, 'minutes').unix(), // 15:00
        bookedBy: {
          name: 'Kevin3',
          house: '9',
          room: '0607',
        },
      },
    ];

    const currentTime = moment('Sun 04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();

    const res1 = await addBooking(sampleBooking1, currentTime);
    const res2 = await addBooking(sampleBooking2, currentTime);
    const res3 = await addBooking(sampleBooking3, currentTime);
    expect(res1).not.toBeNull();
    expect(res2).not.toBeNull();
    expect(res3).not.toBeNull();

    // check if bookings are retrieved correctly
    const bookings = await getCurrentBookings(currentTime);
    // this should return all of them
    expect(bookings.length).toEqual(6);
  });
  it('Check if deleteAllBookings works', async () => {
    const currentTime = moment('Sun 04 23 2023 16:00:00', 'MM DD YYYY HH:mm:ss').unix();
    const startTime = moment('Sun 04 23 2023 14:00:00', 'MM DD YYYY HH:mm:ss');
    const sampleBooking = [
      {
        start: startTime.clone().unix(), // 14:00
        end: startTime.clone().add(30, 'minutes').unix(), // 14:30
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
      {
        start: startTime.clone().add(30, 'minutes').unix(), // 14:30
        end: startTime.clone().add(60, 'minutes').unix(), // 15:00
        bookedBy: {
          name: 'Kevin',
          house: '9',
          room: '0607',
        },
      },
    ];

    const res1 = await addBooking(sampleBooking, currentTime);
    expect(res1).not.toBeNull();

    // delete all
    await deleteAllBookings();
    const bookings = await getCurrentBookings(currentTime);
    expect(bookings.length).toEqual(0);
  });
});

describe('Router Bookings Test', () => {
  it('GET /getCurrentBookings', async () => {
    const res = await request(app)
      .get('/bookings/getCurrentBookings')
      .set('Authorization', `Bearer ${await valid_token_user()}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('currentTime');
    expect(res.body).toHaveProperty('data');
  });
  it('GET /getCurrentBookings AUTH ERROR', async () => {
    const res = await request(app)
      .get('/bookings/getCurrentBookings')
      .set('Authorization', `Bearer ${await invalid_token()}`);
    expect(res.statusCode).toEqual(401);
  });
  it('GET /getCurrentBookings should include correct currentTime', async () => {
    const res = await request(app)
      .get('/bookings/getCurrentBookings')
      .set('Authorization', `Bearer ${await valid_token_user()}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('currentTime');
    // check if unix time stamp
    const unixCurrentTime = res.body.currentTime;
    expect(moment.unix(unixCurrentTime).isValid()).toEqual(true);
  });

  describe('POST /bookings/addBooking', () => {
    it('should return 200 and save the booking when the data is valid', async () => {
      const sampleBooking = [
        {
          start: moment('04 23 2023 23:30:00', 'MM DD YYYY HH:mm:ss').unix(),
          end: moment('04 24 2023 00:00:00 ', 'MM DD YYYY HH:mm:ss').unix(),
          bookedBy: {
            name: 'Kevin1',
            house: '9',
            room: '0607',
          },
        },
      ];
      const currentTime = moment('04 23 2023 15:00:00', 'MM DD YYYY HH:mm:ss').unix();

      const res = await request(app)
        .post('/bookings/addBooking')
        .send(sampleBooking)
        .set('Authorization', `Bearer ${await valid_token_user()}`);

      expect(res.statusCode).toEqual(200);
      // You may want to add more checks here depending on your implementation
      // For example, check the response body or check the database to make sure the booking was saved
    });

    it('should return 400 when the data is invalid', async () => {
      const sampleBooking = [
        {
          start: 'invalid_start_time',
          end: moment('04 24 2023 00:00:00 ', 'MM DD YYYY HH:mm:ss').unix(),
          bookedBy: {
            name: 'Kevin1',
            house: '9',
            room: '0607',
          },
        },
      ];
      const currentTime = moment('04 23 2023 15:00:00', 'MM DD YYYY HH:mm:ss').unix();

      const res = await request(app)
        .post('/bookings/addBooking')
        .send({ bookings: sampleBooking, currentTime })
        .set('Authorization', `Bearer ${await valid_token_user()}`);

      expect(res.statusCode).toEqual(400);
      // You may want to add more checks here depending on your implementation
    });

    it('should return 401 when the request is unauthenticated', async () => {
      const sampleBooking = [
        {
          start: moment('04 23 2023 23:30:00', 'MM DD YYYY HH:mm:ss').unix(),
          end: moment('04 24 2023 00:00:00 ', 'MM DD YYYY HH:mm:ss').unix(),
          bookedBy: {
            name: 'Kevin1',
            house: '9',
            room: '0607',
          },
        },
      ];
      const currentTime = moment('04 23 2023 15:00:00', 'MM DD YYYY HH:mm:ss').unix();

      const res = await request(app)
        .post('/bookings/addBooking')
        .send({ bookings: sampleBooking, currentTime })
        .set('Authorization', `Bearer ${await invalid_token()}`);

      expect(res.statusCode).toEqual(401);
      // You may want to add more checks here depending on your implementation
    });
  });

  it('DELETE /deleteAll should delete all bookings', async () => {
    const res = await request(app)
      .delete('/bookings/deleteAll')
      .set('Authorization', `Bearer ${await valid_token_admin()}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toEqual('All bookings deleted');
  });
  it('DELETE /deleteAll AUTH ERROR', async () => {
    const res = await request(app)
      .delete('/bookings/deleteAll')
      .set('Authorization', `Bearer ${await valid_token_user()}`);
    expect(res.statusCode).toEqual(401);
  });
});
