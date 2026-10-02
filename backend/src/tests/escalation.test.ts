import mongoose from 'mongoose';
import { Complaint } from '../models/complaint.model';
import { User } from '../models/user.model';
import { EscalationService } from '../services/escalation.service';
import { ComplaintStatus, EscalationLevel, PriorityLevel, UserRole } from '../config/constants';
import { env } from '../config/env';

describe('SLA Escalation Engine Tests', () => {
  let testCitizen: any;

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
    testCitizen = await User.create({
      name: 'Escalation Test Citizen',
      phone: '9999900099',
      passwordHash: 'dummy',
      role: UserRole.CITIZEN
    });
  });

  afterAll(async () => {
    await User.deleteMany({ phone: '9999900099' });
    await Complaint.deleteMany({ citizenId: testCitizen._id });
    await mongoose.disconnect();
  });

  it('EscalationService scans overdue complaints and upgrades to ESCALATED', async () => {
    // Create an overdue complaint (deadline 30 hours in past)
    const overdueDeadline = new Date(Date.now() - 30 * 3600000);

    const complaint = await Complaint.create({
      complaintId: `GRV-TEST-${Date.now()}`,
      citizenId: testCitizen._id,
      title: 'Overdue pipeline repair',
      description: 'Pipeline broken and untouched for days.',
      category: 'Water Supply & Leakage',
      department: 'Jal Sansthan / Water Supply',
      priority: PriorityLevel.HIGH,
      status: ComplaintStatus.SUBMITTED,
      deadline: overdueDeadline,
      escalationLevel: EscalationLevel.NONE
    });

    const result = await EscalationService.checkAndEscalateComplaints();
    expect(result.escalatedCount).toBeGreaterThanOrEqual(1);

    const updated = await Complaint.findById(complaint._id);
    expect(updated?.status).toBe(ComplaintStatus.ESCALATED);
    expect(updated?.escalationLevel).toBe(EscalationLevel.LEVEL_2); // >24 hours overdue
  });
});
