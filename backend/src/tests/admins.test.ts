import { connectMongoTest, closeMongoTest, clearMongoTest } from '../db/index';
import { IAdmin, Admin } from '../models/Admin';
import * as adminController from '../controllers/admins/index';
import mongoose from 'mongoose';
const request = require('supertest');
const express = require('express');
const assert = require('assert');

import { app } from '../index';

beforeAll(async () => {
  await connectMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterEach(async () => {
  await clearMongoTest();
}, 10000); // Increase timeout to 10 seconds

afterAll(async () => {
  await closeMongoTest();
}, 10000); // Increase timeout to 10 seconds

describe('Admin Controller Tests', () => {
  const testAdmin: IAdmin = {
    name: 'Test Admin',
    phone: '1234567890',
    assignedDay: 'Monday',
    isAvailable: true,
  };
  const testAdmin2: IAdmin = {
    name: 'Test Admin2',
    phone: '1314567890',
    assignedDay: 'Tuesday',
    isAvailable: true,
  };
  const testAdmin3: IAdmin = {
    name: 'Test Admin3',
    phone: '1334567890',
    assignedDay: 'Tuesday',
    isAvailable: false,
  };

  test('addAdmin should create a new admin', async () => {
    const createdAdmin = await adminController.addAdmin(testAdmin);
    expect(createdAdmin.name).toEqual(testAdmin.name);
    expect(createdAdmin.phone).toEqual(testAdmin.phone);
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
      phone: '0987654321',
      assignedDay: 'Tuesday',
      isAvailable: false,
    };
    await adminController.editAdmin(testAdmin, newAdmin);
    const updatedAdmin = await adminController.getAdmin(newAdmin);
    //check if only one admin is in db now
    const admins = await adminController.getAllAdmins();
    expect(admins.length).toEqual(1);
    expect(updatedAdmin.name).toEqual(newAdmin.name);
    expect(updatedAdmin.phone).toEqual(newAdmin.phone);
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
      phone: '1234567890',
      assignedDay: 'Monday',
      isAvailable: true,
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
      const response = await request(app).get('/admins');
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    test('GET /admins/day/:day should return all admins assigned to a day', async () => {
      await adminController.addAdmin(testAdmin);
      await adminController.addAdmin(testAdmin2);
      await adminController.addAdmin(testAdmin3);
      const response = await request(app).get(`/admins/day/${testAdmin2.assignedDay}`);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(2);
    });

    test('GET /admins/day/:day should return an empty array if no admin is assigned', async () => {
      const response = await request(app).get(`/admins/day/${testAdmin2.assignedDay}`);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(0);
    });

    test('GET /admins/day/:day should return 400 if day is invalid', async () => {
      const response = await request(app).get(`/admins/day/invalidday`);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should create a new admin', async () => {
      const response = await request(app).post('/admins/addAdmin').send(testAdmin);
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(testAdmin.name);
      expect(response.body.phone).toEqual(testAdmin.phone);
      expect(response.body.assignedDay).toEqual(testAdmin.assignedDay);
      expect(response.body.isAvailable).toEqual(testAdmin.isAvailable);
    });

    test('POST /admins/addAdmin should return 400 if fields are missing', async () => {
      const incompleteAdmin = { ...testAdmin, name: '' };
      const response = await request(app).post('/admins/addAdmin').send(incompleteAdmin);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should return 400 if assignedDay is invalid', async () => {
      const invalidDayAdmin = { ...testAdmin, assignedDay: 'InvalidDay' };
      const response = await request(app).post('/admins/addAdmin').send(invalidDayAdmin);
      expect(response.status).toEqual(400);
    });

    test('POST /admins/addAdmin should return 400 if admin already exists', async () => {
      await adminController.addAdmin(testAdmin);
      const response = await request(app).post('/admins/addAdmin').send(testAdmin);
      expect(response.status).toEqual(400);
    });
  });
});
