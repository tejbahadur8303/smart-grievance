import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../models/auditLog.model';

export class AuditService {
  static async log(params: {
    actorId?: Types.ObjectId | string;
    actorName: string;
    actorRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<IAuditLog> {
    return AuditLog.create({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress
    });
  }
}
