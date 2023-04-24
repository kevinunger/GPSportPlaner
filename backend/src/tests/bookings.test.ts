import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { Booking } from '../models/Booking';
import { getGermanLocalTime, addBooking, getCurrentBookings, getBookingsOfDay } from '../controllers/bookings';
import moment from 'moment';
const request = require('supertest');
const express = require('express');
const assert = require('assert');

import { app } from '../index';

beforeAll(async () => {
  await connectMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

describe('Timing Tests', () => {
  it('test current time', done => {
    const currentTime = getGermanLocalTime();
    expect(currentTime.valueOf()).toBeGreaterThan(0);
    done();
  });
});

describe('Add Bookings Tests', () => {
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
  it(' add two similar bookings and see if 2nd one is rejected', async () => {
    const currentTime = moment('Sun Apr 23 2023 15:00:00 GMT+0200');
    const startTime = moment('Sun Apr 23 2023 23:30:00 GMT+0200');
    const endTime = moment('Mon Apr 24 2023 00:00:00 GMT+0200');
    const randomName1 = (Math.random() + 1).toString(36).substring(7);
    const randomName2 = (Math.random() + 1).toString(36).substring(7);
    const sampleBooking1 = [
      {
        start: startTime.clone(), // 10:00
        end: endTime.clone(), // 10:30
        bookedBy: randomName1,
      },
    ];
    const sampleBooking2 = [
      {
        start: startTime.clone(), // 10:00
        end: endTime.clone(), // 10:30
        bookedBy: randomName2,
      },
    ];
    await addBooking(sampleBooking1, currentTime);
    await expect(addBooking(sampleBooking2, currentTime)).rejects.toThrow(
      `Booking already exists Sun Apr 23 2023 23:30:00 GMT+0200 - Mon Apr 24 2023 00:00:00 GMT+0200 by ${randomName1}`
    );
  });
  it('Check if bookings are retrieved correctly', async () => {
    // create multiple bookings

    const startTime = moment('Sun Apr 23 2023 14:00:00 GMT+0200');
    const randomName1 = (Math.random() + 1).toString(36).substring(7);
    const randomName2 = (Math.random() + 1).toString(36).substring(7);
    const randomName3 = (Math.random() + 1).toString(36).substring(7);
    const sampleBooking1 = [
      {
        start: startTime.clone(), // 14:00
        end: startTime.clone().add(30, 'minutes'), // 14:30
        bookedBy: randomName1,
      },
      {
        start: startTime.clone().add(30, 'minutes'), // 14:30
        end: startTime.clone().add(60, 'minutes'), // 15:00
        bookedBy: randomName1,
      },
    ];
    const startTime2 = moment('Sun Apr 23 2023 23:30:00 GMT+0200');
    const sampleBooking2 = [
      {
        start: startTime2.clone(), // 23:30
        end: startTime2.clone().add(30, 'minutes'), // 00:00
        bookedBy: randomName2,
      },
      {
        start: startTime2.clone().add(30, 'minutes'), // 00:00
        end: startTime2.clone().add(60, 'minutes'), // 00:30
        bookedBy: randomName2,
      },
    ];
    const startTime3 = moment('Sun Apr 24 2023 14:00:00 GMT+0200');
    const sampleBooking3 = [
      {
        start: startTime3.clone(), // 14:00
        end: startTime3.clone().add(30, 'minutes'), // 14:30
        bookedBy: randomName1,
      },
      {
        start: startTime3.clone().add(30, 'minutes'), // 14:30
        end: startTime3.clone().add(60, 'minutes'), // 15:00
        bookedBy: randomName1,
      },
    ];

    const currentTime = moment('Sun Apr 23 2023 16:00:00 GMT+0200');

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
});

describe('Get Bookings Test', () => {});
