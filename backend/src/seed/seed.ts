import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { District, Block, Panchayat, Village } from '../models/location.model';
import { Department } from '../models/department.model';
import { SlaRule } from '../models/slaRule.model';
import { Complaint } from '../models/complaint.model';
import { ComplaintUpdate } from '../models/complaintUpdate.model';
import { WorkerTask, TaskStatus } from '../models/workerTask.model';
import { WelfareScheme } from '../models/welfareScheme.model';
import { WelfareApplication, WelfareApplicationStatus } from '../models/welfareApplication.model';
import { RationShop, RationAllocation, RationDistribution } from '../models/ration.model';
import { Notification } from '../models/notification.model';
import {
  UserRole,
  ComplaintStatus,
  PriorityLevel,
  EscalationLevel,
  COMPLAINT_CATEGORIES,
  CATEGORY_DEPARTMENT_MAP
} from '../config/constants';

async function seedDatabase() {
  console.log('[Seed] Connecting to database...');
  await mongoose.connect(env.MONGODB_URI);

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    District.deleteMany({}),
    Block.deleteMany({}),
    Panchayat.deleteMany({}),
    Village.deleteMany({}),
    Department.deleteMany({}),
    SlaRule.deleteMany({}),
    Complaint.deleteMany({}),
    ComplaintUpdate.deleteMany({}),
    WorkerTask.deleteMany({}),
    WelfareScheme.deleteMany({}),
    WelfareApplication.deleteMany({}),
    RationShop.deleteMany({}),
    RationAllocation.deleteMany({}),
    RationDistribution.deleteMany({}),
    Notification.deleteMany({})
  ]);

  console.log('[Seed] Seeding Geography (District, Block, Panchayat, Village)...');
  const district = await District.create({
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    code: 'VNS'
  });

  const block = await Block.create({
    name: 'Kashi Vidyapeeth',
    districtId: district._id,
    code: 'KVP'
  });

  const panchayat = await Panchayat.create({
    name: 'Shivpur Gram Panchayat',
    blockId: block._id,
    districtId: district._id,
    code: 'SHV-GP'
  });

  const village1 = await Village.create({
    name: 'Shivpur Khas',
    panchayatId: panchayat._id,
    blockId: block._id,
    districtId: district._id,
    population: 2800,
    latitude: 25.3512,
    longitude: 82.9715,
    code: 'VIL-001'
  });

  const village2 = await Village.create({
    name: 'Tarna Purwa',
    panchayatId: panchayat._id,
    blockId: block._id,
    districtId: district._id,
    population: 1950,
    latitude: 25.3621,
    longitude: 82.9803,
    code: 'VIL-002'
  });

  console.log('[Seed] Seeding Departments...');
  const departments = await Department.insertMany([
    { name: 'Public Works Department (PWD)', code: 'PWD', description: 'Roads, bridges, culverts and structural repairs' },
    { name: 'Rural Electricity Board', code: 'REB', description: 'Poles, transformers, streetlights and wire safety' },
    { name: 'Jal Sansthan / Water Supply', code: 'JAL', description: 'Drinking water pipelines, tube-wells and handpumps' },
    { name: 'Sanitation & Rural Development', code: 'SRD', description: 'Drainage, waste cleanup and sewage' },
    { name: 'Swachh Bharat Rural Cell', code: 'SBC', description: 'Community & household toilets' },
    { name: 'Public Health & Family Welfare', code: 'PHF', description: 'Primary Health Centers and immunization' },
    { name: 'Education & Child Welfare', code: 'ECW', description: 'Primary schools and Anganwadi centers' },
    { name: 'Food & Civil Supplies (PDS)', code: 'PDS', description: 'Ration shops and fair price distribution' },
    { name: 'Social Welfare Department', code: 'SWD', description: 'Pensions, scholarships and rural welfare schemes' }
  ]);

  console.log('[Seed] Seeding SLA Rules...');
  const slaEntries = [];
  for (const cat of COMPLAINT_CATEGORIES) {
    slaEntries.push(
      { category: cat, priority: PriorityLevel.CRITICAL, maxResolutionHours: 12, level1EscalationHours: 6, level2EscalationHours: 12, level3EscalationHours: 24 },
      { category: cat, priority: PriorityLevel.HIGH, maxResolutionHours: 36, level1EscalationHours: 18, level2EscalationHours: 36, level3EscalationHours: 72 },
      { category: cat, priority: PriorityLevel.MEDIUM, maxResolutionHours: 72, level1EscalationHours: 36, level2EscalationHours: 72, level3EscalationHours: 120 },
      { category: cat, priority: PriorityLevel.LOW, maxResolutionHours: 144, level1EscalationHours: 72, level2EscalationHours: 144, level3EscalationHours: 240 }
    );
  }
  await SlaRule.insertMany(slaEntries);

  console.log('[Seed] Seeding Users with Demo Passwords ("Village@123")...');
  const demoHash = await bcrypt.hash('Village@123', 10);

  const admin = await User.create({
    name: 'District Administrator (Varanasi)',
    phone: '9876543200',
    email: 'admin@demo.local',
    passwordHash: demoHash,
    role: UserRole.ADMIN,
    districtId: district._id,
    languagePreference: 'en',
    isVerified: true
  });

  const officer = await User.create({
    name: 'Rameshwar Sharma (Panchayat Sachiv)',
    phone: '9876543201',
    email: 'officer@demo.local',
    passwordHash: demoHash,
    role: UserRole.PANCHAYAT_OFFICER,
    districtId: district._id,
    blockId: block._id,
    panchayatId: panchayat._id,
    villageId: village1._id,
    languagePreference: 'hi',
    isVerified: true
  });

  const worker1 = await User.create({
    name: 'Manoj Kumar (Field Technician)',
    phone: '9876543202',
    email: 'worker@demo.local',
    passwordHash: demoHash,
    role: UserRole.FIELD_WORKER,
    panchayatId: panchayat._id,
    villageId: village1._id,
    languagePreference: 'hi',
    isVerified: true,
    assignedTasksCount: 3
  });

  const citizen1 = await User.create({
    name: 'Sunita Devi (Gramin)',
    phone: '9876543203',
    email: 'citizen@demo.local',
    passwordHash: demoHash,
    role: UserRole.CITIZEN,
    districtId: district._id,
    blockId: block._id,
    panchayatId: panchayat._id,
    villageId: village1._id,
    languagePreference: 'hi',
    isVerified: true
  });

  const citizen2 = await User.create({
    name: 'Ramprasad Yadav (Kisan)',
    phone: '9876543204',
    email: 'kisan@demo.local',
    passwordHash: demoHash,
    role: UserRole.CITIZEN,
    districtId: district._id,
    blockId: block._id,
    panchayatId: panchayat._id,
    villageId: village2._id,
    languagePreference: 'hi',
    isVerified: true
  });

  console.log('[Seed] Seeding Realistic Complaints in Every Status...');

  // 1. SUBMITTED (Voice Complaint)
  const complaint1 = await Complaint.create({
    complaintId: 'GRV-2026-0001',
    citizenId: citizen1._id,
    title: 'Pani ki main pipeline phoot gayi hai',
    description: 'Gaon ke primary school ke pas mukhya peene ke paani ki pipeline phoot gayi hai, jis se raste par pani bhar gaya hai aur doosre gharon me peene ka pani nahi pahunch raha.',
    source: 'VOICE',
    transcript: 'Hamare gaon me school ke pas drinking water pipeline phoot gayi hai, bahut pani beh raha hai kripya jaldi theek karayein.',
    category: 'Water Supply & Leakage',
    department: 'Jal Sansthan / Water Supply',
    priority: PriorityLevel.HIGH,
    priorityScore: 82,
    aiConfidence: 0.92,
    aiReasoning: 'Critical municipal drinking water supply disruption affecting multiple households.',
    status: ComplaintStatus.SUBMITTED,
    villageId: village1._id,
    villageName: 'Shivpur Khas',
    panchayatId: panchayat._id,
    panchayatName: 'Shivpur Gram Panchayat',
    latitude: 25.3514,
    longitude: 82.9718,
    address: 'Near Primary School, North Gali',
    landmark: 'Opposite Shiv Mandir',
    affectedPeopleEstimate: 75,
    publicSafetyRisk: false,
    deadline: new Date(Date.now() + 36 * 3600000),
    escalationLevel: EscalationLevel.NONE
  });

  await ComplaintUpdate.create({
    complaintId: complaint1._id,
    previousStatus: ComplaintStatus.SUBMITTED,
    newStatus: ComplaintStatus.SUBMITTED,
    changedById: citizen1._id,
    changedByName: citizen1.name,
    changedByRole: citizen1.role,
    message: 'Voice grievance submitted by citizen via voice recording.'
  });

  // 2. IN_PROGRESS (Worker on-site with before photo)
  const complaint2 = await Complaint.create({
    complaintId: 'GRV-2026-0002',
    citizenId: citizen1._id,
    title: 'Main raste par bijli ka taar toota hua gira hai',
    description: 'Bazar jane wale raste par bijli ka live taar zameen par gira hua hai. Bacchon aur janwaron ke liye bhari khatra hai.',
    source: 'TEXT',
    category: 'Streetlights & Electrical',
    department: 'Rural Electricity Board',
    priority: PriorityLevel.CRITICAL,
    priorityScore: 98,
    aiConfidence: 0.96,
    aiReasoning: 'Emergency live wire fallen on public thoroughfare posing immediate electrocution risk.',
    status: ComplaintStatus.IN_PROGRESS,
    villageId: village1._id,
    villageName: 'Shivpur Khas',
    panchayatId: panchayat._id,
    panchayatName: 'Shivpur Gram Panchayat',
    latitude: 25.3521,
    longitude: 82.9725,
    landmark: 'Bazar Chowk Pole #14',
    affectedPeopleEstimate: 200,
    publicSafetyRisk: true,
    assignedOfficerId: officer._id,
    assignedWorkerId: worker1._id,
    deadline: new Date(Date.now() + 8 * 3600000),
    escalationLevel: EscalationLevel.NONE
  });

  const task2 = await WorkerTask.create({
    taskId: 'TSK-2026-0001',
    complaintId: complaint2._id,
    complaintCode: complaint2.complaintId,
    workerId: worker1._id,
    assignedById: officer._id,
    title: complaint2.title,
    instructions: 'Isolate feeder switch immediately and reconnect overhead wire safely.',
    category: complaint2.category,
    priority: complaint2.priority,
    villageName: complaint2.villageName,
    status: TaskStatus.IN_PROGRESS,
    startedAt: new Date(),
    beforePhotos: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80']
  });

  // 3. RESOLVED - Awaiting Citizen Confirmation
  const complaint3 = await Complaint.create({
    complaintId: 'GRV-2026-0003',
    citizenId: citizen1._id,
    title: 'Gande pani ki naali jam ho kar ubal rahi hai',
    description: 'Gali number 3 me naali pichle ek hafte se jam hai jisse ganda pani sadak par phail gaya hai.',
    source: 'TEXT',
    category: 'Drainage & Sewage',
    department: 'Sanitation & Rural Development',
    priority: PriorityLevel.MEDIUM,
    priorityScore: 60,
    aiConfidence: 0.89,
    aiReasoning: 'Sanitation hazard requiring drain de-silting and cleanout.',
    status: ComplaintStatus.RESOLVED,
    villageId: village1._id,
    villageName: 'Shivpur Khas',
    panchayatId: panchayat._id,
    panchayatName: 'Shivpur Gram Panchayat',
    latitude: 25.353,
    longitude: 82.973,
    landmark: 'Gali 3, Chaupal',
    affectedPeopleEstimate: 45,
    publicSafetyRisk: false,
    assignedOfficerId: officer._id,
    assignedWorkerId: worker1._id,
    resolvedAt: new Date(),
    deadline: new Date(Date.now() + 24 * 3600000),
    escalationLevel: EscalationLevel.NONE
  });

  const task3 = await WorkerTask.create({
    taskId: 'TSK-2026-0002',
    complaintId: complaint3._id,
    complaintCode: complaint3.complaintId,
    workerId: worker1._id,
    assignedById: officer._id,
    title: complaint3.title,
    category: complaint3.category,
    priority: complaint3.priority,
    villageName: complaint3.villageName,
    status: TaskStatus.COMPLETED,
    beforePhotos: ['https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=600&q=80'],
    afterPhotos: ['https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80'],
    completionNotes: 'Cleaned drain thoroughly with desilting equipment and disinfected with lime bleaching powder.'
  });

  // 4. CLOSED - Citizen verified & rated
  const complaint4 = await Complaint.create({
    complaintId: 'GRV-2026-0004',
    citizenId: citizen2._id,
    title: 'Sadak par gehra khadda tha jisse bike gir gayi thi',
    description: 'Gaon ke pravesh dwar par sadak tooti hui thi.',
    source: 'TEXT',
    category: 'Roads & Potholes',
    department: 'Public Works Department (PWD)',
    priority: PriorityLevel.HIGH,
    priorityScore: 78,
    status: ComplaintStatus.CLOSED,
    villageId: village2._id,
    villageName: 'Tarna Purwa',
    panchayatId: panchayat._id,
    isCitizenVerified: true,
    citizenVerifiedAt: new Date(Date.now() - 48 * 3600000),
    closedAt: new Date(Date.now() - 48 * 3600000),
    citizenRating: 5,
    citizenFeedback: 'Bohot accha kaam kiya gaya, sham tak sadak theek ho gayi.',
    escalationLevel: EscalationLevel.NONE
  });

  // 5. ESCALATED - SLA Overdue breached
  const complaint5 = await Complaint.create({
    complaintId: 'GRV-2026-0005',
    citizenId: citizen2._id,
    title: 'Handpump se peela ganda pani nikal raha hai',
    description: 'Purani Basti handpump se peela pani aa raha hai aur log bimar pad rahe hain.',
    source: 'TEXT',
    category: 'Water Supply & Leakage',
    department: 'Jal Sansthan / Water Supply',
    priority: PriorityLevel.HIGH,
    priorityScore: 88,
    status: ComplaintStatus.ESCALATED,
    villageId: village2._id,
    villageName: 'Tarna Purwa',
    panchayatId: panchayat._id,
    deadline: new Date(Date.now() - 30 * 3600000), // Overdue by 30 hours!
    escalationLevel: EscalationLevel.LEVEL_2,
    assignedOfficerId: officer._id
  });

  // 6. REOPENED - Citizen rejected resolution
  const complaint6 = await Complaint.create({
    complaintId: 'GRV-2026-0006',
    citizenId: citizen1._id,
    title: 'Streetlight pole #3 bulb repair',
    description: 'Chaupal ki streetlight raat ko band rehti hai.',
    source: 'TEXT',
    category: 'Streetlights & Electrical',
    department: 'Rural Electricity Board',
    priority: PriorityLevel.MEDIUM,
    priorityScore: 55,
    status: ComplaintStatus.REOPENED,
    isReopened: true,
    reopenReason: 'Worker marked completed but bulb was never replaced. It is still dark at night.',
    reopenedAt: new Date(),
    villageId: village1._id,
    villageName: 'Shivpur Khas',
    panchayatId: panchayat._id
  });

  console.log('[Seed] Seeding Welfare Schemes & Applications...');
  const scheme1 = await WelfareScheme.create({
    code: 'PM-AWAS-GRAMIN',
    name: 'Pradhan Mantri Awas Yojana (Gramin)',
    hindiName: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
    department: 'Rural Development',
    description: 'Financial assistance of ₹1,20,000 for constructing a pucca house for rural homeless or kutcha house dwellers.',
    eligibilityCriteria: ['Homeless families or families living in zero/one room kutcha houses', 'No adult earning member between 16-59 years', 'SECC 2011 deprivation list'],
    benefits: 'Direct DBT subsidy of ₹1.2 Lakh + 90 days MGNREGA wages for labor',
    requiredDocuments: ['Aadhaar Card', 'Bank Passbook Copy', 'Land/Plot Certificate', 'Income Certificate', 'Current Kutcha House Photo'],
    financialAssistanceAmount: 120000
  });

  const scheme2 = await WelfareScheme.create({
    code: 'PM-KISAN-SAMMAN',
    name: 'PM Kisan Samman Nidhi',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    department: 'Agriculture & Farmers Welfare',
    description: 'Income support of ₹6,000 per year in three equal installments directly to land-holding farmer families.',
    eligibilityCriteria: ['Small and marginal farmers holding cultivable land', 'Registered in land revenue records'],
    benefits: '₹6,000 annually credited directly to bank account via DBT',
    requiredDocuments: ['Aadhaar Card', 'Land Revenue Records (Khatauni)', 'Active Bank Account linked with NPCI'],
    financialAssistanceAmount: 6000
  });

  const scheme3 = await WelfareScheme.create({
    code: 'VRIDDHA-PENSION',
    name: 'Old Age Pension Scheme (Vridhavastha Pension)',
    hindiName: 'वृद्धावस्था पेंशन योजना',
    department: 'Social Welfare Department',
    description: 'Monthly social security financial pension for senior citizens living below poverty line.',
    eligibilityCriteria: ['Age 60 years or above', 'BPL family cardholder or annual income below ₹46,080'],
    benefits: '₹1,000 per month pension disbursed quarterly',
    requiredDocuments: ['Age Proof / Voter Card', 'Aadhaar Card', 'BPL / Income Certificate', 'Bank Passbook Copy'],
    financialAssistanceAmount: 1000
  });

  // Welfare Applications
  await WelfareApplication.create({
    applicationId: 'APP-2026-0001',
    schemeId: scheme1._id,
    schemeName: scheme1.name,
    citizenId: citizen1._id,
    applicantName: citizen1.name,
    applicantPhone: citizen1.phone,
    villageName: 'Shivpur Khas',
    villageId: village1._id,
    panchayatId: panchayat._id,
    category: 'OBC',
    annualIncome: 38000,
    status: WelfareApplicationStatus.UNDER_VERIFICATION,
    officerRemarks: 'Field physical inspection of kutcha house scheduled for Wednesday.'
  });

  await WelfareApplication.create({
    applicationId: 'APP-2026-0002',
    schemeId: scheme2._id,
    schemeName: scheme2.name,
    citizenId: citizen2._id,
    applicantName: citizen2.name,
    applicantPhone: citizen2.phone,
    villageName: 'Tarna Purwa',
    villageId: village2._id,
    panchayatId: panchayat._id,
    category: 'OBC',
    annualIncome: 52000,
    status: WelfareApplicationStatus.APPROVED,
    verifiedById: officer._id,
    verifiedByName: officer.name,
    verifiedAt: new Date(),
    officerRemarks: 'Khatauni verified with Tehsil registry. Approved for DBT release.'
  });

  console.log('[Seed] Seeding Ration / PDS Transparency Records...');
  const shop1 = await RationShop.create({
    shopCode: 'FPS-UP-VNS-042',
    dealerName: 'Santosh Kumar Verma (Kotedar)',
    contactPhone: '+91-98765-43212',
    villageId: village1._id,
    villageName: 'Shivpur Khas',
    panchayatId: panchayat._id,
    panchayatName: 'Shivpur Gram Panchayat',
    activeCardHolders: 520,
    openingHours: '08:30 AM - 05:00 PM (Closed Tuesday)'
  });

  // Monthly Allocation for October 2026
  await RationAllocation.insertMany([
    { shopId: shop1._id, monthYear: '2026-10', commodity: 'Wheat', allocatedQuantityKg: 5200, distributedQuantityKg: 3850, unitPriceRs: 2.0 },
    { shopId: shop1._id, monthYear: '2026-10', commodity: 'Rice', allocatedQuantityKg: 7800, distributedQuantityKg: 5600, unitPriceRs: 3.0 },
    { shopId: shop1._id, monthYear: '2026-10', commodity: 'Sugar', allocatedQuantityKg: 520, distributedQuantityKg: 490, unitPriceRs: 18.0 }
  ]);

  // Citizen Distribution History
  await RationDistribution.insertMany([
    {
      citizenId: citizen1._id,
      maskedCardNumber: 'UP-AAY-****-5829',
      familyMembersCount: 4,
      monthYear: '2026-10',
      shopId: shop1._id,
      commodity: 'Wheat',
      entitledQuantityKg: 15,
      distributedQuantityKg: 15,
      distributedDate: new Date(),
      status: 'DISTRIBUTED'
    },
    {
      citizenId: citizen1._id,
      maskedCardNumber: 'UP-AAY-****-5829',
      familyMembersCount: 4,
      monthYear: '2026-10',
      shopId: shop1._id,
      commodity: 'Rice',
      entitledQuantityKg: 20,
      distributedQuantityKg: 20,
      distributedDate: new Date(),
      status: 'DISTRIBUTED'
    },
    {
      citizenId: citizen2._id,
      maskedCardNumber: 'UP-PHH-****-9104',
      familyMembersCount: 5,
      monthYear: '2026-10',
      shopId: shop1._id,
      commodity: 'Wheat',
      entitledQuantityKg: 25,
      distributedQuantityKg: 20, // Short quantity discrepancy!
      distributedDate: new Date(),
      isDiscrepancyFlagged: true,
      status: 'DISCREPANCY'
    }
  ]);

  console.log('[Seed] Seeding Notifications...');
  await Notification.create({
    recipientId: citizen1._id,
    title: 'Grievance Verified by Officer',
    message: 'Your complaint GRV-2026-0002 has been verified by Panchayat Sachiv and worker assigned.',
    type: 'COMPLAINT_UPDATE',
    relatedComplaintCode: 'GRV-2026-0002'
  });

  await Notification.create({
    recipientId: officer._id,
    title: 'URGENT: SLA Overdue Escalation (Level 2)',
    message: 'Complaint GRV-2026-0005 (Handpump drinking water) has exceeded SLA by 30 hours.',
    type: 'ESCALATION',
    relatedComplaintCode: 'GRV-2026-0005'
  });

  console.log('===========================================================');
  console.log('✅ Realistic Development Database Seeded Successfully!');
  console.log('Demo Credentials (All accounts use password: "Village@123"):');
  console.log('  1. ADMIN:             Phone: 9876543200 | Email: admin@demo.local');
  console.log('  2. PANCHAYAT OFFICER: Phone: 9876543201 | Email: officer@demo.local');
  console.log('  3. FIELD WORKER:      Phone: 9876543202 | Email: worker@demo.local');
  console.log('  4. CITIZEN 1:         Phone: 9876543203 | Email: citizen@demo.local');
  console.log('  5. CITIZEN 2 (Kisan): Phone: 9876543204 | Email: kisan@demo.local');
  console.log('===========================================================');

  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
