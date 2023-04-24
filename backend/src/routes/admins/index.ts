import express from 'express';
import { IBooking, Booking } from '../../models/Booking';
import { IAdmin, Admin } from '../../models/Admin';
import { IResponse } from '../../types/index';
import {
  getCurrentBookings,
  getBookingsOfDay,
  addBooking,
  getGermanLocalTime,
  deleteAllBookings,
} from '../../controllers/bookings/index';
const router = express.Router();
const moment = require('moment-timezone');

import * as adminController from '../../controllers/admins/index';

// get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await adminController.getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(400).json({ message: 'Error getting admins' });
  }
});

// get all admins assigned to a day
router.get('/day/:day', async (req, res) => {
  //parse day to Day type
  if (!req.params.day) {
    res.status(400).json({ message: 'Day is required' });
  }

  //check if day is valid
  const day = req.params.day;
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!validDays.includes(day)) {
    res.status(400).json({ message: 'Please enter a valid day' });
  } else {
    try {
      const admins = await adminController.getAdminByAssignedDay(day);
      res.json(admins);
    } catch (err) {
      res.status(400).json({ message: 'Error' });
    }
  }
});

// set admin
router.post('/addAdmin', async (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: 'Admin is required' });
  }

  const admin: IAdmin = req.body;
  // check if valid admin
  if (!admin.name || !admin.phone || !admin.assignedDay) {
    res.status(400).json({ message: 'Admin Values missing' });
  } else {
    try {
      const createdAdmin = await adminController.addAdmin(admin);
      res.json(createdAdmin);
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }
});

//edit admin
router.put('/editAdmin', async (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: 'Admin is required' });
  }
  const oldAdmin = req.body.oldAdmin;
  const newAdmin = req.body.newAdmin;
  // check if valid admin
  if (!oldAdmin || !newAdmin) {
    res.status(400).json({ message: 'Admin Values missing' });
  }
  try {
    const updatedAdmin = await adminController.editAdmin(oldAdmin, newAdmin);
    res.json(updatedAdmin);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

export default router;
