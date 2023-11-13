import express from 'express';
import { IResponse } from '../../../../frontend/src/app/types/index';
import * as authController from '../../controllers/auth/index';
import { authMaster } from '../../controllers/auth/index';
const router = express.Router();
const moment = require('moment-timezone');

router.post('/login', async function (req, res) {
  if (!req.body.name || !req.body.password || !req.body.house || !req.body.room) {
    res.status(400).send({ error: 'name, password, house and room are required' });
  }
  try {
    const jwt = await authController.authenticate(req.body);

    const response: IResponse<string> = {
      data: jwt,
      currentTime: moment(),
    };

    res.send(response);
  } catch (e) {
    // send erropr message with 400 status code
    res.status(400).send({ error: e.message });
  }
});

router.post('/changePw', authMaster, async function (req, res) {
  const role = req.body.role;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  if (!role || !oldPassword || !newPassword) {
    res.status(400).send({ error: 'role, oldPassword and newPassword are required' });
  }
  try {
    await authController.changePw(oldPassword, newPassword, role);
    res.send({ message: 'Password changed' });
  } catch (e) {
    // send erropr message with 400 status code
    res.status(400).send({ error: e.message });
  }
});

// route to set initial password, if none are set for role
router.post('/setInitialPw', async function (req, res) {
  const role = req.body.role;
  const newPassword = req.body.newPassword;

  if (!role || !newPassword) {
    res.status(400).send({ error: 'role and newPassword are required' });
    return;
  }

  try {
    await authController.setInitialPw(newPassword, role);
    res.send({ message: 'Password set!' });
  } catch (e) {
    console.log(e);
    // send error message with 400 status code
    res.status(400).send({ error: e.message });
  }
});

router.post('/refreshToken', async function (req, res) {
  const token = req.body.token;
  console.log(req.body.token);
  if (!token) {
    res.status(400).send({ error: 'refreshToken is required' });
    return;
  }

  try {
    const jwt = await authController.refreshToken(token);
    const response: IResponse<string> = {
      data: jwt,
      currentTime: moment(),
    };
    res.send(response);
  } catch (e) {
    // send error message with 400 status code
    res.status(400).send({ error: e.message });
  }
});

export default router;
