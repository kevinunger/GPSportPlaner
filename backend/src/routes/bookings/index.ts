import express from "express";
import Booking from "../../models/Booking";

const router = express.Router();

// get all bookings where end is less than 24 hours from now
router.get("/getCurrentBookings", async function (req, res) {
  const bookings = await Booking.find({
    end: { $lt: Date.now() + 24 * 60 * 60 * 1000 },
  });

  res.send({
    data: bookings,
    currentTime: Date.now(),
  });
});

// get all bookings of the current day
router.get("/getBookings", async function (req, res) {
  const bookings = await Booking.find({
    start: { $lt: Date.now() + 24 * 60 * 60 * 1000 },
    end: { $gt: Date.now() },
  });

  res.send({
    data: bookings,
    currentTime: Date.now(),
  });
});

// enter new booking into database
router.post("/addBooking", async function (req, res) {
  // request body is array of Bookings sorted by start time
  // validate if last booking is max. 24 hours from now

  const lastBookingEnd = req.body[req.body.length - 1].end;
  if (lastBookingEnd > Date.now() + 24 * 60 * 60 * 1000) {
    res.status(400).send({
      message: "last booking is more than 24 hours from now",
    });
    return;
  }

  // check if max. 4 bookings
  if (req.body.length > 4) {
    res.status(400).send({
      message: "max. 4 bookings per day",
    });
    return;
  }

  // validate if bookings are in order
  for (let i = 0; i < req.body.length - 1; i++) {
    if (req.body[i].end > req.body[i + 1].start) {
      res.status(400).send({
        message: "bookings are not in order",
      });
      return;
    }
  }

  // check if name is provided
  if (!req.body.bookedBy) {
    res.status(400).send({
      message: "name is required",
    });
    return;
  }

  // save bookings to database
  const bookings = await Booking.insertMany(req.body);

  res.send({
    data: bookings,
    currentTime: Date.now(),
  });
});
export default router;
