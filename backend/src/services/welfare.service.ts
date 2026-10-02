import { WelfareScheme } from '../models/welfareScheme.model';
import { WelfareApplication, WelfareApplicationStatus } from '../models/welfareApplication.model';
import { NotificationService } from '../providers/notifications/notification.service';
import { AuditService } from './audit.service';

export class WelfareService {
  static async getSchemes(activeOnly: boolean = true) {
    const query = activeOnly ? { isActive: true } : {};
    return WelfareScheme.find(query).sort({ createdAt: -1 });
  }

  static async getSchemeById(id: string) {
    return WelfareScheme.findById(id);
  }

  static async createScheme(data: any, adminUser: any) {
    const scheme = await WelfareScheme.create(data);
    await AuditService.log({
      actorId: adminUser._id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      action: 'WELFARE_SCHEME_CREATED',
      resource: 'WelfareScheme',
      resourceId: scheme.code
    });
    return scheme;
  }

  static async applyForScheme(citizenUser: any, data: {
    schemeId: string;
    annualIncome?: number;
    category?: string;
    documentsUploaded?: string[];
  }) {
    const scheme = await WelfareScheme.findById(data.schemeId);
    if (!scheme) throw new Error('Welfare scheme not found.');

    const count = await WelfareApplication.countDocuments();
    const applicationId = `APP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const app = await WelfareApplication.create({
      applicationId,
      schemeId: scheme._id,
      schemeName: scheme.name,
      citizenId: citizenUser._id,
      applicantName: citizenUser.name,
      applicantPhone: citizenUser.phone,
      villageName: citizenUser.villageName,
      villageId: citizenUser.villageId,
      panchayatId: citizenUser.panchayatId,
      category: data.category || 'General',
      annualIncome: data.annualIncome,
      documentsUploaded: data.documentsUploaded || [],
      status: WelfareApplicationStatus.SUBMITTED
    });

    await NotificationService.send({
      recipientId: citizenUser._id,
      title: 'Welfare Application Submitted',
      message: `Your application ${applicationId} for scheme "${scheme.name}" has been received.`,
      type: 'WELFARE_UPDATE'
    });

    return app;
  }

  static async getApplications(query: { citizenId?: string; panchayatId?: string; status?: string }) {
    const filter: any = {};
    if (query.citizenId) filter.citizenId = query.citizenId;
    if (query.panchayatId) filter.panchayatId = query.panchayatId;
    if (query.status) filter.status = query.status;

    return WelfareApplication.find(filter).sort({ createdAt: -1 });
  }

  static async reviewApplication(
    applicationId: string,
    officerUser: any,
    decision: 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED',
    remarks: string
  ) {
    const app = await WelfareApplication.findOne({ applicationId });
    if (!app) throw new Error('Application not found.');

    app.status = decision as WelfareApplicationStatus;
    app.officerRemarks = remarks;
    app.verifiedById = officerUser._id;
    app.verifiedByName = officerUser.name;
    app.verifiedAt = new Date();
    await app.save();

    await NotificationService.send({
      recipientId: app.citizenId,
      title: `Welfare Application: ${decision}`,
      message: `Your application ${app.applicationId} for "${app.schemeName}" is now ${decision}. Remarks: ${remarks}`,
      type: 'WELFARE_UPDATE'
    });

    await AuditService.log({
      actorId: officerUser._id,
      actorName: officerUser.name,
      actorRole: officerUser.role,
      action: `WELFARE_APP_${decision}`,
      resource: 'WelfareApplication',
      resourceId: app.applicationId,
      details: { remarks }
    });

    return app;
  }
}
