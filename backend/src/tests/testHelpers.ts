import { changePw } from '../controllers/auth';
import { IAdmin, IResponse, IErrorResponse, IBooking, Role } from '../../../frontend/src/app/types/index';
import bcrypt from 'bcrypt';
import { app } from '../index';
const request = require('supertest');
const express = require('express');
const assert = require('assert');
import mongoose from 'mongoose';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

export const user_password_hashed = '$2y$10$NBqfkI6WsjwwQJ5CQdOzJuI6IIl48jre7lQSZzjpEJyyEURmPhWIu';
export const admin_password_hashed = '$2y$10$X7MWqcJHm8gxivEk37YtQe92WQzvbVoUFwXk8twkRD9Cr0TQ24.Ny';
export const master_password_hashed = '$2y$10$.FQIfMb0DyGLqp27ND.LdOqkiKCAWb2OE/AGEoqGwWIklcDF6H.E.';

export async function testPws() {
  const res = bcrypt.compare('user_password', user_password_hashed);
  return testPws;
}

// Set up users with their passwords
export async function createUsers() {
  await changePw('oldPassword', 'user_password', Role.User);
  await changePw('oldPassword', 'admin_password', Role.Admin);
  await changePw('oldPassword', 'master_password', Role.Master);
}

const valid_token_user = async () =>
  await jwt.sign(
    {
      name: 'Test Kevin',
      house: '9',
      room: '123',
      role: Role.User,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2w',
    }
  );

const valid_token_admin = async () =>
  await jwt.sign(
    {
      name: 'Test Admin',
      house: '9',
      room: '123',
      role: Role.Admin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2w',
    }
  );

const valid_token_master = async () =>
  await jwt.sign(
    {
      name: 'Test Master',
      house: '9',
      room: '123',
      role: Role.Master,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2w',
    }
  );

const invalid_token = async () =>
  await jwt.sign(
    {
      name: 'Test Admin',
      house: '9',
      room: '123',
      role: Role.User,
    },
    'Some other secret',
    {
      expiresIn: '2w',
    }
  );

export { valid_token_user, valid_token_admin, valid_token_master, invalid_token };
