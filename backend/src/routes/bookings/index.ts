import express from 'express';
import { IBooking, Booking } from '../../models/Booking';
import { IResponse } from '../../../../frontend/src/app/types/index';

import {
  getCurrentBookings,
  getBookingsOfDay,
  addBooking,
  getGermanLocalTime,
  deleteAllBookings,
} from '../../controllers/bookings/index';
const router = express.Router();
const moment = require('moment-timezone');

import { authUser, authAdmin, authMaster } from '../../controllers/auth/index';

// just return all bookings
router.get('/', authUser, async function (req, res) {
  const bookings = await Booking.find();
  const currentTime = moment();

  const response: IResponse<IBooking[]> = {
    data: bookings,
    currentTime,
  };
  res.send(response);

  res.send({
    data: bookings,
    currentTime: moment(),
  });
});

// get all bookings which
// start > current time - 30min && end > current time
// start and end are timestamps
router.get('/getCurrentBookings', authUser, async function (req, res) {
  const currentTime = moment();
  const bookings = await getCurrentBookings(currentTime);

  const response: IResponse<IBooking[]> = {
    data: bookings,
    currentTime: currentTime,
  };
  res.send(response);
});

// get all bookings of the given day ?day="Sun Apr 23 2023 21:25:48 GMT+0200"
router.get('/getBookingsByDate', authUser, async function (req, res) {
  if (!req.query.day) {
    res.status(400).send({
      error: 'day is required',
    });
  }
  //localhost:3000/bookings/getBookingsByDate?day=22042023
  const day = moment(req.query.day);
  const bookingsOfDay = await getBookingsOfDay(day);

  const currentTime = moment();

  const response: IResponse<IBooking[]> = {
    data: bookingsOfDay,
    currentTime: currentTime,
  };
  res.send(response);
});

// enter new booking into database
router.post('/addBooking', authUser, async function (req, res) {
  const bookings = req.body;
  // convert booking start, end to moment objects
  for (let i = 0; i < bookings.length; i++) {
    bookings[i].start = moment(bookings[i].start);
    bookings[i].end = moment(bookings[i].end);
  }

  const currentTime = moment();

  // check if bookings

  try {
    const savedBookings = await addBooking(bookings, currentTime);
    res.send({
      data: savedBookings,
      currentTime,
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
      currentTime,
    });
  }
});

// delete all bookings
router.delete('/deleteAll', authAdmin, async function (req, res) {
  const currentTime = moment();
  deleteAllBookings();
  res.send({
    data: 'all bookings deleted',
    currentTime,
  });
});

export default router;
