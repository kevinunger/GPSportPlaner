import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { Admin } from '../models/Admin';
import { Role, IAdmin, Day, IResponse } from '../../../frontend/src/app/types/index';

import * as adminController from '../controllers/admins/index';
import mongoose from 'mongoose';
const request = require('supertest');
const express = require('express');
const assert = require('assert');
import { createUsers, invalid_token, valid_token_admin, valid_token_master, valid_token_user } from './testHelpers';

import { changePw } from '../controllers/auth';
import { app } from '../index';
import bcrypt from 'bcrypt';

const user_password_hashed = bcrypt.hashSync('user_password', 10);
const admin_password_hashed = bcrypt.hashSync('admin_password', 10);
const master_password_hashed = bcrypt.hashSync('master_password', 10);

beforeAll(async () => {
  await connectMongoTest();
  await createUsers();
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

const testAdmin: IAdmin = {
  name: 'Test Admin',
  phoneNumber: '1234567890',
  assignedDay: 'Monday' as Day,
  isAvailable: true,
  roomNumber: '789',
  houseNumber: '123',
};
const testAdmin2: IAdmin = {
  name: 'Test Admin2',
  phoneNumber: '1314567890',
  assignedDay: 'Tuesday' as Day,
  isAvailable: true,
  roomNumber: '123',
  houseNumber: '456',
};
const testAdmin3: IAdmin = {
  name: 'Test Admin3',
  phoneNumber: '1334567890',
  assignedDay: 'Tuesday' as Day,
  isAvailable: false,
  roomNumber: '8888',
  houseNumber: '456',
};

describe('Admin Controller Tests', () => {
  test('addAdmin should create a new admin', async () => {
    const createdAdmin = await adminController.addAdmin(testAdmin);

    expect(createdAdmin.name).toEqual(testAdmin.name);
    expect(createdAdmin.phoneNumber).toEqual(testAdmin.phoneNumber);
    expect(createdAdmin.assignedDay).toEqual(testAdmin.assignedDay);
    expect(createdAdmin.isAvailable).toEqual(testAdmin.isAvailable);
  });

  test('deleteAdmin should remove an admin', async () => {
    const createdAdmin = await adminController.addAdmin(testAdmin);
    const deletedAdmin = await adminController.deleteAdmin(createdAdmin);
    expect(deletedAdmin).toEqual(createdAdmin);
    const foundAdmin = await Admin.findById(createdAdmin);
    expect(foundAdmin).toBeNull();
  });

  test('getAllAdmins should return all admins', async () => {
    await adminController.addAdmin(testAdmin);
    const admins = await adminController.getAllAdmins();
    expect(admins.length).toEqual(1);
  });

  test('getAdminByAssignedDay should return all admins assigned to a day', async () => {
    await adminController.addAdmin(testAdmin); // Create an admin before searching
    const admins = await adminController.getAdminByAssignedDay(testAdmin.assignedDay);
    expect(admins.length).toBeGreaterThan(0);
  });

  test('editAdmin should update an existing admin', async () => {
    await adminController.addAdmin(testAdmin);
    const newAdmin = {
      name: 'Updated Admin',
      phoneNumber: '0987654321',
      assignedDay: 'Tuesday' as Day,
      isAvailable: false,
      roomNumber: '123',
      houseNumber: '456',
    };
    await adminController.editAdmin(testAdmin, newAdmin);
    const updatedAdmin = await adminController.getAdmin(newAdmin);
    //check if only one admin is in db now
    const admins = await adminController.getAllAdmins();
    expect(admins.length).toEqual(1);
    expect(updatedAdmin.name).toEqual(newAdmin.name);
    expect(updatedAdmin.phoneNumber).toEqual(newAdmin.phoneNumber);
    expect(updatedAdmin.assignedDay).toEqual(newAdmin.assignedDay);
    expect(updatedAdmin.isAvailable).toEqual(newAdmin.isAvailable);
  });

  test('addAdmin should throw error if fields are missing', async () => {
    const incompleteAdmin = { ...testAdmin, name: '' };
    await expect(adminController.addAdmin(incompleteAdmin)).rejects.toThrow('Please fill all fields');
  });

  test('addAdmin should throw error if assignedDay is invalid', async () => {
    const invalidDayAdmin = { ...testAdmin, assignedDay: 'InvalidDay' };
    // ignore ts error
    // @ts-ignore
    await expect(adminController.addAdmin(invalidDayAdmin)).rejects.toThrow('Please enter a valid day');
  });

  test('addAdmin should throw error if admin already exists', async () => {
    await adminController.addAdmin(testAdmin);
    await expect(adminController.addAdmin(testAdmin)).rejects.toThrow('Admin already exists');
  });

  test('deleteAdmin should throw error if admin does not exist', async () => {
    const nonExistentAdmin = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Admin',
      phoneNumber: '1234567890',
      assignedDay: 'Monday' as Day,
      isAvailable: true,
      roomNumber: '789',
      houseNumber: '123',
    };
    await expect(adminController.deleteAdmin(nonExistentAdmin)).rejects.toThrow('Admin does not exist');
  });

  test('getAdminByAssignedDay should throw error if assignedDay is invalid', async () => {
    await expect(adminController.getAdminByAssignedDay('InvalidDay')).rejects.toThrow('Please enter a valid day');
  });

  test('getAdminByAssignedDay should return empty array if no admin is assigned', async () => {
    const admins = await adminController.getAdminByAssignedDay(testAdmin.assignedDay);
    expect(admins.length).toEqual(0);
  });

  // test adminRouter routes with supertest
  describe('check admin routes', () => {
    test('GET /admins should return all admins', async () => {
      await adminController.addAdmin(testAdmin);

      const response = await request(app)
        .get('/admins')
        .set('Authorization', `Bearer ${await valid_token_user()}`);
      expect(response.status).toEqual(200);
      const body = response.body as IResponse<IAdmin[]>;

      expect(body.data.length).toEqual(1);
    });

    test('GET /admins/day/:day should return all admins assigned to a day', async () => {
      await adminController.addAdmin(testAdmin);
      await adminController.addAdmin(testAdmin2);
      await adminController.addAdmin(testAdmin3);
      const response = await request(app)
        .get(`/admins/day/${testAdmin2.assignedDay}`)
        .set('Authorization', `Bearer ${await valid_token_user()}`);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(2);
    });

    test('GET /admins/day/:day should return an empty array if no admin is assigned', async () => {
      const response = await request(app)
        .get(`/admins/day/${testAdmin2.assignedDay}`)
        .set('Authorization', `Bearer ${await valid_token_user()}`);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    test('GET /admins/day/:day should return 400 if day is invalid', async () => {
      const response = await request(app)
        .get(`/admins/day/invalidday`)
        .set('Authorization', `Bearer ${await valid_token_user()}`);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should create a new admin', async () => {
      const response = await request(app)
        .post('/admins/addAdmin')
        .set('Authorization', `Bearer ${await valid_token_admin()}`)
        .send(testAdmin);
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(testAdmin.name);
      expect(response.body.phoneNumber).toEqual(testAdmin.phoneNumber);
      expect(response.body.assignedDay).toEqual(testAdmin.assignedDay);
      expect(response.body.isAvailable).toEqual(testAdmin.isAvailable);
    });

    test('POST /admins/addAdmin should return 400 if fields are missing', async () => {
      const incompleteAdmin = { ...testAdmin, name: '' };
      const response = await request(app)
        .post('/admins/addAdmin')
        .set('Authorization', `Bearer ${await valid_token_admin()}`)
        .send(incompleteAdmin);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should return 400 if assignedDay is invalid', async () => {
      const invalidDayAdmin = { ...testAdmin, assignedDay: 'InvalidDay' };
      const response = await request(app)
        .post('/admins/addAdmin')
        .set('Authorization', `Bearer ${await valid_token_admin()}`)
        .send(invalidDayAdmin);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should return 400 if admin already exists', async () => {
      await adminController.addAdmin(testAdmin);

      const response = await request(app)
        .post('/admins/addAdmin')
        .set('Authorization', `Bearer ${await valid_token_admin()}`)
        .send(testAdmin);
      expect(response.status).toEqual(400);
    });
  });
});
