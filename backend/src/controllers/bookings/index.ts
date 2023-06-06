import { IBooking } from '../../../../frontend/src/app/types/index';
import { Booking } from '../../models/Booking';

import moment, { Moment } from 'moment-timezone';

// always return the correct german local time and !!accounts for daylight saving time!!
// Moment<2023-04-22T17:33:22+02:00>
export function getGermanLocalTime(): Moment {
  const germanyLocalTime = moment().tz('Europe/Berlin');
  return germanyLocalTime;
}

// start > current time - 30min && end > current time
export async function getCurrentBookings(currentTime: number) {
  const bookings = await Booking.find({
    start: { $gte: moment(currentTime).clone().subtract(30, 'minutes').unix() },
  });

  // SORT BY START TIME DESCENDING
  bookings.sort((a, b) => {
    const starta = a.start;
    const startb = b.start;
    if (moment(starta).isBefore(startb)) {
      return -1;
    }
    if (moment(starta).isAfter(startb)) {
      return 1;
    }
    return 0;
  });

  return bookings;
}

export async function getBookingsOfDay(day: Moment): Promise<IBooking[]> {
  const startOfDayTime = day.clone().startOf('day').unix();
  const endOfDayTime = day.clone().endOf('day').unix();
  const bookings = await Booking.find({
    start: { $gte: startOfDayTime, $lte: endOfDayTime },
    end: { $gte: startOfDayTime, $lte: endOfDayTime },
  });
  return bookings;
}

export async function addBooking(bookings: IBooking[], currentTime: number) {
  // check if bookings are valid
  await _checkIfBookingsAreValid(bookings, currentTime);

  try {
    const savedBookings = await Booking.insertMany(bookings);
    // save to db
    return savedBookings;
  } catch (err) {
    throw new Error(err);
  }
}

export async function changeBookings(bookingsToRemove: IBooking[], bookingsToAdd: IBooking[]) {
  // check if old bookings exists
  for (let booking of bookingsToRemove) {
    const bookingExists = await Booking.findOne({
      start: booking.start,
      end: booking.end,
      'bookedBy.name': booking.bookedBy.name,
      'bookedBy.room': booking.bookedBy.room,
      'bookedBy.house': booking.bookedBy.house,
    });
    if (!bookingExists) {
      throw new Error(
        `Booking does not exist ${booking.start} - ${booking.end} by ${booking.bookedBy.name}`
      );
    }
  }

  try {
    // delete old bookings
    const deletedBooking = await Booking.deleteMany({
      start: { $in: bookingsToRemove.map(b => b.start) },
      end: { $in: bookingsToRemove.map(b => b.end) },
    });
    console.log('deletedBooking: ', deletedBooking);

    // bookingsToAdd can be empty (if the user just wants to delete bookings)
    if (bookingsToAdd.length === 0) {
      return;
    }

    // check if new bookings are valid
    await _checkIfBookingsAreValid(bookingsToAdd, moment().unix());

    // save new bookings
    const savedBooking = await Booking.insertMany(bookingsToAdd);
    return savedBooking;
  } catch (err) {
    throw new Error(err);
  }
}

// delete all bookings from db
export async function deleteAllBookings() {
  try {
    await Booking.deleteMany({});
  } catch (err) {
    throw new Error(err);
  }
}

async function _checkIfBookingsAreValid(bookings: IBooking[], currentTime: number) {
  // check if bookings are in order and using correct types
  // check if last booking is more than 24 hours from now
  const lastBookingEnd = moment.unix(bookings[bookings.length - 1].end);
  const timeIn24Hours = moment.unix(currentTime + 86400);

  if (lastBookingEnd.isAfter(timeIn24Hours) || lastBookingEnd.isSame(timeIn24Hours)) {
    throw new Error('End of last booking is more than 24 hours from now');
  }

  // check if max. 4 bookings
  if (bookings.length > 4) {
    throw new Error('You can only book max. 4 bookings at a time');
  }

  // check if bookings are in order and using correct types
  for (let i = 0; i < bookings.length; i++) {
    const start = moment(bookings[i].start);
    const end = moment(bookings[i].end);

    // check if values are provided
    if (
      !moment.isMoment(start) ||
      !moment.isMoment(end) ||
      !bookings[i].bookedBy.name ||
      !bookings[i].bookedBy.house ||
      !bookings[i].bookedBy.room
    ) {
      throw new Error(`missing values ${bookings[i].bookedBy}`);
    }

    if (
      !start.isValid ||
      !end.isValid ||
      typeof bookings[i].bookedBy.name != 'string' ||
      typeof bookings[i].bookedBy.house != 'string' ||
      typeof bookings[i].bookedBy.room != 'string'
    ) {
      throw new Error('wrong type(s)');
    }

    // check if bookings are in order (start time of current booking is end of previous booking)
    if (i > 0) {
      if (!start.isSame(bookings[i - 1].end)) {
        throw new Error('Bookings not in order');
      }
    }

    // check if booking already exists
    const booking = await Booking.findOne({
      start: bookings[i].start,
      end: bookings[i].end,
    });
    if (booking) {
      throw new Error(
        `Booking already exists ${booking.start} - ${booking.end} by ${booking.bookedBy.name}`
      );
    }
  }
}
