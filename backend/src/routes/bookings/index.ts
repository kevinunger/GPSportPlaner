import express from "express";
import { IBooking, Booking } from "../../models/Booking";
import { IResponse } from "../../types/index";
const moment = require("moment-timezone");

const router = express.Router();

// always return the correct german local time and !!accounts for daylight saving time!!
function getGermanLocalTime(): number {
  const germanyLocalTime = moment().tz("Europe/Berlin");
  // Convert the local time to a Unix timestamp (in milliseconds)
  const germanyLocalTimestamp = germanyLocalTime.valueOf();
  return germanyLocalTimestamp;
}

// always return the correct german timezone offset and accounts for daylight saving time
// only used for Fronted!
function getGermanTimeZoneOffset(): number {
  const germanyLocalTime = moment().tz("Europe/Berlin");
  // Get the timezone offset in milliseconds
  const germanyLocalTimezoneOffset = germanyLocalTime.utcOffset() * 60 * 1000;
  return germanyLocalTimezoneOffset;
}

// just return all bookings
router.get("/", async function (req, res) {
  const bookings = await Booking.find();
  const currentTime = getGermanLocalTime();
  const currentTimeZoneOffset = getGermanTimeZoneOffset();

  const response: IResponse<IBooking[]> = {
    data: bookings,
    currentTime,
    currentTimeZoneOffset,
  };
  res.send(response);

  res.send({
    data: bookings,
    currentTime: getGermanLocalTime(),
  });
});

// get all bookings which
// start > current time - 30min && end > current time
// start and end are timestamps
router.get("/getCurrentBookings", async function (req, res) {
  //curent timestamp
  const currentTime = getGermanLocalTime();
  const bookings = await getCurrentBookings(currentTime);

  const response: IResponse<IBooking[]> = {
    data: bookings,
    currentTime: currentTime,
    currentTimeZoneOffset: getGermanTimeZoneOffset(),
  };
  res.send(response);
});

// get all bookings of the given day
router.get("/getBookingsByDay", async function (req, res) {
  // day is of format DD-MMM-YYYY e.g. 14-Apr-2023
  const givenDayStartTime = moment(req.query.day, "DD-MMM-YYYY").valueOf();
  const bookingsOfDay = await getBookingsOfDay(givenDayStartTime);

  const currentTime = getGermanLocalTime();

  const response: IResponse<IBooking[]> = {
    data: bookingsOfDay,
    currentTime: currentTime,
    currentTimeZoneOffset: getGermanTimeZoneOffset(),
  };
  res.send(response);
});

// enter new booking into database
router.post("/addBooking", async function (req, res) {
  const bookings = req.body;
  const currentTime = getGermanLocalTime();
  const currentTimeZoneOffset = getGermanTimeZoneOffset();

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
      currentTimeZoneOffset,
    });
  }
});

// start > current time - 30min && end > current time
async function getCurrentBookings(currentTime) {
  const bookings = await Booking.find({
    start: { $gt: currentTime - 30 * 60 * 1000 },
    end: { $gt: currentTime },
  });
  return bookings;
}

async function getBookingsOfDay(startOfDayTime: number): Promise<IBooking[]> {
  const bookings = await Booking.find({
    start: { $lt: startOfDayTime + 24 * 60 * 60 * 1000 },
    end: { $gt: startOfDayTime },
  });
  return bookings;
}

async function addBooking(bookings: IBooking[], currentTime: number) {
  // check if last booking is more than 24 hours from now
  const lastBookingEnd = bookings[bookings.length - 1].end;
  if (lastBookingEnd > currentTime + 24 * 60 * 60 * 1000) {
    throw new Error("last booking is more than 24 hours from now");
  }

  // check if max. 4 bookings
  if (bookings.length > 4) {
    throw new Error("max. 4 bookings at a time");
  }

  // check if bookings are in order and using correct types
  for (let i = 0; i < bookings.length - 1; i++) {
    if (
      typeof bookings[i].start !== "number" ||
      typeof bookings[i].end !== "number" ||
      typeof bookings[i].bookedBy !== "string"
    ) {
      throw new Error("wrong type");
    }
    if (bookings[i].end > bookings[i + 1].start) {
      throw new Error("bookings are not in order");
    }

    // check if values are provided
    if (!bookings[i].start || !bookings[i].end || !bookings[i].bookedBy) {
      throw new Error("missing values");
    }

    // check if booking already exists
    const booking = await Booking.findOne({
      start: bookings[i].start,
      end: bookings[i].end,
      bookedBy: bookings[i].bookedBy,
    });
    if (booking) {
      throw new Error(
        `booking already exists ${bookings[i].start} - ${bookings[i].end} by ${bookings[i].bookedBy}`
      );
    }
  }

  const savedBookings = await Booking.insertMany(bookings);
  return savedBookings;
}
export default router;
