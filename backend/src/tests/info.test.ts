const request = require('supertest');
const express = require('express');
const assert = require('assert');
import { createUsers, invalid_token, valid_token_admin, valid_token_master, valid_token_user } from './testHelpers';
import { app } from '../index';

describe('GET /info', () => {
  it('responds with Hello World', async () => {
    const res = await request(app).get('/info');
    expect(res.statusCode).toBe(200);
    assert(res.body.data, 'Hello World');
  });
});
