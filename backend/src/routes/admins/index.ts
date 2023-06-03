import express from 'express';
import { IAdmin } from '../../models/Admin';
const router = express.Router();
const moment = require('moment-timezone');

import { authAdmin, authUser } from '../../controllers/auth/index';

import * as adminController from '../../controllers/admins/index';

// get all admins
router.get('/', authUser, async (req, res) => {
  try {
    const admins = await adminController.getAllAdmins();
    const response = {
      data: admins,
    };
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: 'Error getting admins' });
  }
});

// get all admins assigned to a day
router.get('/day/:day', authUser, async (req, res) => {
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
router.post('/addAdmin', authAdmin, async (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: 'Admin is required' });
  }

  const admin: IAdmin = req.body;
  // check if valid admin
  if (!admin.name || !admin.phoneNumber || !admin.assignedDay || !admin.roomNumber || !admin.houseNumber) {
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
router.put('/editAdmin', authAdmin, async (req, res) => {
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

router.delete('/deleteAdmin', authAdmin, async (req, res) => {
  if (!req.body) {
    res.status(400).json({ message: 'Admin is required' });
  }
  const admin = req.body;
  // check if admin is IAdmin
  if (!admin.name || !admin.phoneNumber || !admin.assignedDay || !admin.roomNumber || !admin.houseNumber) {
    res.status(400).json({ message: 'Admin Values missing' });
  }
  try {
    const deletedAdmin = await adminController.deleteAdmin(admin);
    res.json(deletedAdmin);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});

export default router;
