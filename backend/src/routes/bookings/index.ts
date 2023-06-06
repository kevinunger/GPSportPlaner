import express from 'express';
import { IResponse, IUser } from '../../../../frontend/src/app/types/index';
import { Booking, IBooking } from '../../models/Booking';

import {
  addBooking,
  deleteAllBookings,
  getBookingsOfDay,
  getCurrentBookings,
  changeBookings,
} from '../../controllers/bookings/index';
const router = express.Router();
const moment = require('moment-timezone');
import jwt, { JwtPayload } from 'jsonwebtoken';

import { authAdmin, authUser } from '../../controllers/auth/index';

// just return all bookings
router.get('/', authUser, async function (req, res) {
  const bookings = await Booking.find();
  const currentTime = moment().unix();

  const response: IResponse<IBooking[]> = {
    data: bookings,
    currentTime,
  };
  res.send(response);
});

// get all bookings which
// start > current time - 30min && end > current time
// start and end are timestamps
router.get('/getCurrentBookings', authUser, async function (req, res) {
  const currentTime = moment().unix();
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

  const currentTime = moment().unix();

  const response: IResponse<IBooking[]> = {
    data: bookingsOfDay,
    currentTime: currentTime,
  };
  res.send(response);
});

// enter new booking into database
router.post('/addBooking', authUser, async function (req, res) {
  const bookings = req.body;
  // check if there are bookings in body
  if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).send({
      error: 'bookings are required',
    });
  }

  // convert booking start, end to moment objects
  for (let i = 0; i < bookings.length; i++) {
    bookings[i].start = moment(bookings[i].start);
    bookings[i].end = moment(bookings[i].end);
  }

  const currentTime = moment().unix();

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

// change booking by providing old and new booking (new can also be empty for deletion)
router.post('/changeBooking', authUser, async function (req, res) {
  console.log(req.body.bookingsToRemove);
  const bookingsToRemove = req.body?.bookingsToRemove;
  const bookingsToAdd = req.body?.bookingsToAdd;

  if (!bookingsToRemove || !bookingsToAdd) {
    res.status(400).send({
      error: 'oldBookings and newBookings are required',
    });
  }

  // check if oldBooking is booked by user
  const bookingUser = bookingsToRemove[0].bookedBy;

  // check if bookedBy is the same for all oldBookings and newBookings
  bookingsToRemove.forEach(booking => {
    if (
      booking.bookedBy.name != bookingUser.name ||
      booking.bookedBy.house != bookingUser.house ||
      booking.bookedBy.room != bookingUser.room
    ) {
      res.status(400).send({
        error: 'bookedBy is not the same for all oldBookings',
      });
    }
  });
  bookingsToAdd.forEach(booking => {
    if (
      booking.bookedBy.name != bookingUser.name ||
      booking.bookedBy.house != bookingUser.house ||
      booking.bookedBy.room != bookingUser.room
    ) {
      res.status(400).send({
        error: 'bookedBy is not the same for all oldBookings',
      });
    }
  });

  // check if user is allowed to change booking by checking if token name is the same as bookingUser.name,
  // token house is the same as bookingUser.house and
  // token room is the same as bookingUser.room

  const token = req.headers.authorization.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    return res.status(401).send({ error: 'Invalid token' });
  }
  const nameToken = decoded.name;
  const houseToken = decoded.house;
  const roomToken = decoded.room;

  // NOTE: This is not secure
  // a user can just login with the same name as the one who booked the booking (if he knows the name, room and house)
  // and then change the booking
  // but who cares

  if (
    nameToken != bookingUser.name ||
    houseToken != bookingUser.house ||
    roomToken != bookingUser.room
  ) {
    res.status(400).send({
      error: 'You are not allowed to change this booking',
    });
  }

  try {
    await changeBookings(bookingsToRemove, bookingsToAdd);
    res.send({
      data: 'Booking changed',
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
    });
  }
});

// delete all bookings
router.delete('/deleteAll', authAdmin, async function (req, res) {
  const currentTime = moment().unix();
  try {
    await deleteAllBookings();
    res.send({
      data: 'All bookings deleted',
      currentTime,
    });
  } catch (err) {
    res.status(400).send({
      error: err.message,
      currentTime,
    });
  }
});

export default router;
