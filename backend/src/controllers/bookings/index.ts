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
  console.log(bookings[0].bookedBy);
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
    if (!moment.isMoment(start) || !moment.isMoment(end) || !bookings[i].bookedBy) {
      throw new Error(`missing values ${bookings[i].bookedBy}`);
    }

    if (!start.isValid || !end.isValid || typeof bookings[i].bookedBy !== 'string') {
      throw new Error('wrong type');
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
      throw new Error(`Booking already exists ${booking.start} - ${booking.end} by ${booking.bookedBy}`);
    }

    // check if booking start and end is exactly 30 mins apart
    // if (bookings[i].end.isSame(bookings[i].start.clone().add(30, 'minutes'))) {
    //   throw new Error('booking not 30 mins apart');
    // }
  }

  try {
    // save bookings
    // const bookingsToSave = bookings.map(booking => {
    //   return {
    //     start: moment(booking.start),
    //     end: moment(booking.end),
    //     bookedBy: booking.bookedBy,
    //   };
    // });
    const savedBookings = await Booking.insertMany(bookings);
    // save to db
    return savedBookings;
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
