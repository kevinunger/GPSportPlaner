import { Booking } from '../../models/Booking';
import { IBooking } from '../../types/index';
import moment, { Moment } from 'moment-timezone';

// always return the correct german local time and !!accounts for daylight saving time!!
// Moment<2023-04-22T17:33:22+02:00>
export function getGermanLocalTime(): Moment {
  const germanyLocalTime = moment().tz('Europe/Berlin');
  return germanyLocalTime;
}

// start > current time - 30min && end > current time
export async function getCurrentBookings(currentTime: Moment) {
  const bookings = await Booking.find({
    start: { $gt: currentTime.clone().subtract(30, 'minutes').toDate() },
    end: { $gt: currentTime.toDate() },
  });
  return bookings;
}

export async function getBookingsOfDay(day: Moment): Promise<IBooking[]> {
  const startOfDayTime = day.clone().startOf('day');
  const endOfDayTime = day.clone().endOf('day');
  console.log(day);
  const bookings = await Booking.find({
    start: { $gte: startOfDayTime.toDate(), $lte: endOfDayTime.toDate() },
    end: { $gte: startOfDayTime.toDate(), $lte: endOfDayTime.toDate() },
  });
  return bookings;
}

export async function addBooking(bookings: IBooking[], currentTime: Moment) {
  // check if last booking is more than 24 hours from now
  const lastBookingEnd = moment(bookings[bookings.length - 1].end);
  const timeIn24Hours = currentTime.clone().add(24, 'hours');
  if (lastBookingEnd.isAfter(timeIn24Hours) || lastBookingEnd.isSame(timeIn24Hours)) {
    throw new Error('End of last booking is more than 24 hours from now');
  }

  // check if max. 4 bookings
  if (bookings.length > 4) {
    throw new Error('You can only book max. 4 bookings at a time');
  }

  // check if bookings are in order and using correct types
  for (let i = 0; i < bookings.length; i++) {
    // check if the values are valid moment objects
    if (!moment.isMoment(bookings[i].start) || !moment.isMoment(bookings[i].end)) {
      throw new Error('not a moment object');
    }

    // check if values are provided
    if (!bookings[i].start || !bookings[i].end || !bookings[i].bookedBy) {
      throw new Error('missing values');
    }

    if (!bookings[i].start.isValid || !bookings[i].end.isValid || typeof bookings[i].bookedBy !== 'string') {
      throw new Error('wrong type');
    }

    // check if bookings are in order (start time of current booking is end of previous booking)
    if (i > 0) {
      if (!bookings[i].start.isSame(bookings[i - 1].end)) {
        throw new Error('Bookings not in order');
      }
    }

    // check if booking already exists
    const booking = await Booking.findOne({
      start: bookings[i].start,
      end: bookings[i].end,
      bookedBy: bookings[i].bookedBy,
    });
    if (booking) {
      throw new Error(`Booking already exists ${bookings[i].start} - ${bookings[i].end} by ${bookings[i].bookedBy}`);
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
    return savedBookings;
  } catch (err) {
    throw new Error(err);
  }
}
