import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { User } from '../models/user.model';
import { env } from '../config/env';

describe('Auth API & Security Tests', () => {
  const app = createApp();

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({ phone: { $in: ['9999900001', '9999900002'] } });
    await mongoose.disconnect();
  });

  it('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/v1/auth/register should successfully register a new citizen', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Citizen',
        phone: '9999900001',
        password: 'Password@123',
        languagePreference: 'hi'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.phone).toBe('9999900001');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/login should authenticate citizen and return tokens', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        phone: '9999900001',
        password: 'Password@123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/v1/auth/login with wrong password should fail', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        phone: '9999900001',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
