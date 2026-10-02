import { RationShop, RationAllocation, RationDistribution, RationGrievance } from '../models/ration.model';
import { ComplaintService } from './complaint.service';
import { NotificationService } from '../providers/notifications/notification.service';
import { AuditService } from './audit.service';

export class RationService {
  static async getShops(panchayatId?: string) {
    const filter = panchayatId ? { panchayatId } : {};
    return RationShop.find(filter).sort({ villageName: 1 });
  }

  static async getShopAllocations(shopId: string, monthYear?: string) {
    const filter: any = { shopId };
    if (monthYear) filter.monthYear = monthYear;
    return RationAllocation.find(filter).sort({ monthYear: -1 });
  }

  static async getCitizenDistributions(citizenId: string) {
    return RationDistribution.find({ citizenId })
      .populate('shopId', 'shopCode dealerName villageName contactPhone')
      .sort({ monthYear: -1 });
  }

  static async reportGrievance(citizenUser: any, data: {
    shopId: string;
    grievanceType: 'SHORT_QUANTITY' | 'SHOP_CLOSED' | 'OVERCHARGING' | 'BIOMETRIC_ISSUE' | 'RATION_NOT_GIVEN' | 'OTHER';
    description: string;
  }) {
    const shop = await RationShop.findById(data.shopId);
    if (!shop) throw new Error('Ration shop not found.');

    const grievance = await RationGrievance.create({
      citizenId: citizenUser._id,
      citizenName: citizenUser.name,
      citizenPhone: citizenUser.phone,
      shopId: shop._id,
      shopCode: shop.shopCode,
      grievanceType: data.grievanceType,
      description: data.description,
      status: 'SUBMITTED'
    });

    // Create formal civic complaint linked to PDS category
    const complaintTitle = `PDS Issue: ${data.grievanceType.replace('_', ' ')} at Shop ${shop.shopCode}`;
    const formalComplaint = await ComplaintService.createComplaint({
      citizenId: citizenUser._id,
      title: complaintTitle,
      description: `Ration grievance reported for Fair Price Shop ${shop.shopCode} (${shop.dealerName}): ${data.description}`,
      category: 'PDS / Ration Supply',
      villageName: shop.villageName,
      panchayatName: shop.panchayatName,
      affectedPeopleEstimate: 30,
      publicSafetyRisk: false
    }, citizenUser);

    grievance.complaintId = formalComplaint._id;
    await grievance.save();

    await NotificationService.send({
      recipientId: citizenUser._id,
      title: 'PDS Grievance Lodged',
      message: `Your report regarding Fair Price Shop ${shop.shopCode} has been logged as complaint ${formalComplaint.complaintId}.`,
      type: 'RATION_UPDATE',
      relatedComplaintId: formalComplaint._id,
      relatedComplaintCode: formalComplaint.complaintId
    });

    await AuditService.log({
      actorId: citizenUser._id,
      actorName: citizenUser.name,
      actorRole: citizenUser.role,
      action: 'RATION_GRIEVANCE_LODGED',
      resource: 'RationGrievance',
      resourceId: grievance._id.toString(),
      details: { shopCode: shop.shopCode, type: data.grievanceType }
    });

    return { grievance, complaint: formalComplaint };
  }

  static async getGrievances(shopId?: string) {
    const filter = shopId ? { shopId } : {};
    return RationGrievance.find(filter).sort({ createdAt: -1 });
  }
}
