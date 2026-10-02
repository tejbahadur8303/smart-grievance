import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { ComplaintService } from '../services/complaint.service';
import { Complaint } from '../models/complaint.model';
import { User } from '../models/user.model';
import { UserRole, ComplaintStatus, PriorityLevel } from '../config/constants';
import { env } from '../config/env';

describe('Complaint Redressal & Priority Workflow Tests', () => {
  const app = createApp();
  let citizenToken = '';
  let officerToken = '';
  let workerToken = '';
  let testCitizen: any;
  let testOfficer: any;
  let testWorker: any;

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);

    // Create test accounts
    testCitizen = await User.create({
      name: 'Test Citizen Workflow',
      phone: '9999900010',
      passwordHash: 'dummy',
      role: UserRole.CITIZEN
    });

    testOfficer = await User.create({
      name: 'Test Officer Workflow',
      phone: '9999900011',
      passwordHash: 'dummy',
      role: UserRole.PANCHAYAT_OFFICER
    });

    testWorker = await User.create({
      name: 'Test Worker Workflow',
      phone: '9999900012',
      passwordHash: 'dummy',
      role: UserRole.FIELD_WORKER
    });

    const jwt = require('jsonwebtoken');
    citizenToken = jwt.sign({ userId: testCitizen._id.toString(), role: UserRole.CITIZEN }, env.JWT_ACCESS_SECRET);
    officerToken = jwt.sign({ userId: testOfficer._id.toString(), role: UserRole.PANCHAYAT_OFFICER }, env.JWT_ACCESS_SECRET);
    workerToken = jwt.sign({ userId: testWorker._id.toString(), role: UserRole.FIELD_WORKER }, env.JWT_ACCESS_SECRET);
  });

  afterAll(async () => {
    await User.deleteMany({ phone: { $in: ['9999900010', '9999900011', '9999900012'] } });
    await Complaint.deleteMany({ citizenId: testCitizen._id });
    await mongoose.disconnect();
  });

  it('Deterministic AI Priority Engine classifies fallen wire as CRITICAL', async () => {
    const res = await request(app)
      .post('/api/v1/ai/analyze-complaint')
      .send({ text: 'Raste par bijli ka taar toota hua gira hai current aa raha hai' });

    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe(PriorityLevel.CRITICAL);
    expect(res.body.data.category).toBe('Streetlights & Electrical');
  });

  it('Citizen submits complaint with GPS and AI routing', async () => {
    const res = await request(app)
      .post('/api/v1/complaints')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Water pipe leak in Shivpur',
        description: 'Pani ki pipeline leak ho rahi hai bohot pani waste ho raha hai.',
        villageName: 'Shivpur Khas',
        latitude: 25.3512,
        longitude: 82.9715,
        affectedPeopleEstimate: 50
      });

    expect(res.status).toBe(201);
    expect(res.body.data.complaintId).toMatch(/^GRV-\d{4}-\d{4}$/);
    expect(res.body.data.status).toBe(ComplaintStatus.SUBMITTED);
    expect(res.body.data.category).toBe('Water Supply & Leakage');
  });

  it('Citizen verifies resolution: Can close or reopen complaint', async () => {
    // Create complaint
    const complaint = await ComplaintService.createComplaint({
      citizenId: testCitizen._id,
      title: 'Broken handpump handle',
      description: 'Handpump handle toot gaya hai.',
      category: 'Water Supply & Leakage'
    }, testCitizen);

    // Verify
    await ComplaintService.verifyComplaint(complaint.complaintId, testOfficer, 'VERIFIED', 'Verified on-site');

    // Assign worker
    await ComplaintService.assignWorker(complaint.complaintId, testWorker._id.toString(), testOfficer);

    // Citizen confirms resolution -> Should be CLOSED
    const verifiedComplaint = await ComplaintService.verifyResolution(
      complaint.complaintId,
      testCitizen,
      true,
      'Well repaired!',
      5
    );

    expect(verifiedComplaint.status).toBe(ComplaintStatus.CLOSED);
    expect(verifiedComplaint.isCitizenVerified).toBe(true);
    expect(verifiedComplaint.citizenRating).toBe(5);
  });
});
