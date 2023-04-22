import express from 'express';
import { IBooking, Booking } from '../../models/Booking';
import { IResponse } from '../../types/index';
import { getCurrentBookings, getBookingsOfDay, addBooking, getGermanLocalTime } from '../../controllers/bookings/index';
const router = express.Router();
const moment = require('moment-timezone');

// just return all bookings
router.get('/', async function (req, res) {
  const currentTime = getGermanLocalTime();

  res.send({
    data: 'Hello World',
    currentTime: getGermanLocalTime(),
  });
});

export default router;
