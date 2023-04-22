import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { Booking } from '../models/Booking';
import { getGermanLocalTime, addBooking, getCurrentBookings, getBookingsOfDay } from '../controllers/bookings';
import moment from 'moment';

beforeAll(async () => {
  await connectMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

describe('Bookings Tests', () => {
  it('test current time', done => {
    const currentTime = getGermanLocalTime();
    expect(currentTime.valueOf()).toBeGreaterThan(0);
    done();
  });
  it('add a booking', async () => {
    const startTime = moment('Sat Apr 22 2023 16:00:00 GMT+0200');
    const sampleBookings = [
      {
        start: startTime.clone(),
        end: startTime.clone().add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')),
        end: startTime.clone().add(moment.duration(30, 'minutes')).add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
    ];
    const currentTime = getGermanLocalTime();
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
    let currentTime = moment('Sat Apr 22 2023 15:50:00 GMT+0200');
    const startTime = moment('Sat Apr 23 2023 15:30:00 GMT+0200');
    const sampleBookings = [
      {
        start: startTime.clone(),
        end: startTime.clone().add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
    ];

    // await expect(() => addBooking(sampleBookings, currentTime)).rejects.toThrow('not implemented'); // Or .toThrow('expectedErrorMessage')

    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'End of last booking is more than 24 hours from now'
    );

    // check what happens if current time is EXACTLY 24 hours after end
    // this should fail as well
    currentTime = moment('Sat Apr 22 2023 16:00:00 GMT+0200');
    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'End of last booking is more than 24 hours from now'
    );

    // check what happens if current time is one millisecond after the 24 hour limit
    // this should succeed
    currentTime.add(1, 'milliseconds');
    const savedBooking = await addBooking(sampleBookings, currentTime);
    expect(savedBooking).not.toBeNull();
  });

  it('add a more than 4 bookings', async () => {
    let currentTime = moment('Sat Apr 23 2023 16:00:00 GMT+0200');
    const startTime = moment('Sat Apr 22 2023 15:30:00 GMT+0200');
    const sampleBookings = [
      {
        start: startTime.clone(),
        end: startTime.clone().add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        end: startTime.clone().add(2 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(2 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        end: startTime.clone().add(3 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(3 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        end: startTime.clone().add(4 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(4 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        end: startTime.clone().add(5 * moment.duration(30, 'minutes').asMilliseconds(), 'milliseconds'),
        bookedBy: 'Kevin',
      },
    ];

    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow(
      'You can only book max. 4 bookings at a time'
    );
  });
  it('add a booking that overlaps with another booking', async () => {
    const currentTime = moment('Sat Apr 23 2023 16:00:00 GMT+0200');
    const startTime = moment('Sat Apr 22 2023 10:00:00 GMT+0200');
    const sampleBookings = [
      {
        start: startTime.clone(),
        end: startTime.clone().add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')),
        end: startTime.clone().add(moment.duration(30, 'minutes')),
        bookedBy: 'Kevin',
      },
    ];
    await addBooking(sampleBookings, currentTime);

    // add a booking that overlaps with the first booking
    const overlappingBooking = {
      start: startTime.clone(),
      end: startTime.clone().add(moment.duration(30, 'minutes')),
      bookedBy: 'Kevin',
    };
    await expect(addBooking([overlappingBooking], currentTime)).rejects.toThrow(
      'Booking already exists Sat Apr 22 2023 10:00:00 GMT+0200 - Sat Apr 22 2023 10:30:00 GMT+0200 by Kevin'
    );
  });
  it('add a booking that is not in order', async () => {
    const currentTime = moment('Sat Apr 23 2023 16:00:00 GMT+0200');
    const startTime = moment('Sat Apr 22 2023 10:00:00 GMT+0200');
    const sampleBookings = [
      {
        start: startTime.clone(), // 10:00
        end: startTime.clone().add(moment.duration(30, 'minutes')), // 10:30
        bookedBy: 'Kevin',
      },
      {
        start: startTime.clone().add(moment.duration(90, 'minutes')), // 11:30
        end: startTime.clone().add(moment.duration(120, 'minutes')), // 12:00
        bookedBy: 'Kevin',
      },
    ];
    await expect(addBooking(sampleBookings, currentTime)).rejects.toThrow('Bookings not in order');
  });
  it('add bookings to different dates and check if they are retrieved correctly', async () => {
    const currentTime = moment('Sat Apr 23 2023 16:00:00 GMT+0200');
    const startTime = moment('Sat Apr 22 2023 10:00:00 GMT+0200');
    const bookingsToday = [
      {
        start: startTime.clone(), // 10:00
        end: startTime.clone().add(moment.duration(30, 'minutes')), // 10:30
        bookedBy: 'KevinToday',
      },
      {
        start: startTime.clone().add(moment.duration(30, 'minutes')), // 11:30
        end: startTime.clone().add(moment.duration(60, 'minutes')), // 12:00
        bookedBy: 'KevinToday',
      },
    ];
    const res = await addBooking(bookingsToday, currentTime);
    //this should work
    expect(res).not.toBeNull();
    //check if getBookingsOfDay() returns the correct bookings
    const bookingsTodayRetrieved = (await getBookingsOfDay(startTime)).length;
    expect(bookingsTodayRetrieved).toEqual(bookingsToday.length);

    const startTimeTomorrow = moment('Sat Apr 23 2023 10:00:00 GMT+0200');
    const bookingsTomorrow = [
      {
        start: startTimeTomorrow.clone(), // 10:00
        end: startTimeTomorrow.clone().add(moment.duration(30, 'minutes')), // 10:30
        bookedBy: 'KevinTomorrow',
      },
    ];
    const res1 = await addBooking(bookingsTomorrow, currentTime);
    //this should work
    expect(res1).not.toBeNull();

    const bookingsTomorrowRetrieved = await getBookingsOfDay(startTimeTomorrow);
    expect(bookingsTomorrowRetrieved.length).toEqual(bookingsTomorrow.length);
  });
});
