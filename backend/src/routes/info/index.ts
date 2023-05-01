import express from 'express';
import { IBooking, Booking } from '../../models/Booking';
import { IResponse } from '../../../../frontend/src/app/types/index';
import { getCurrentBookings, getBookingsOfDay, addBooking, getGermanLocalTime } from '../../controllers/bookings/index';
const router = express.Router();
const moment = require('moment-timezone');

// just return all bookings
router.get('/', async function (req, res) {
  const currentTime = moment();

  res.send({
    data: 'Hello World',
    currentTime: moment(),
  });
});

export default router;
