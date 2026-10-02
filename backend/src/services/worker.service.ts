import { WorkerTask, TaskStatus } from '../models/workerTask.model';
import { Complaint } from '../models/complaint.model';
import { ComplaintUpdate } from '../models/complaintUpdate.model';
import { ComplaintStatus } from '../config/constants';
import { NotificationService } from '../providers/notifications/notification.service';
import { AuditService } from './audit.service';

export class WorkerService {
  static async getTasks(workerId: string, status?: string) {
    const query: any = { workerId };
    if (status) query.status = status;
    return WorkerTask.find(query).sort({ createdAt: -1 });
  }

  static async acceptTask(taskId: string, workerUser: any) {
    const task = await WorkerTask.findOne({ taskId, workerId: workerUser._id });
    if (!task) throw new Error('Task not found.');

    task.status = TaskStatus.ACCEPTED;
    await task.save();

    await AuditService.log({
      actorId: workerUser._id,
      actorName: workerUser.name,
      actorRole: workerUser.role,
      action: 'TASK_ACCEPTED',
      resource: 'WorkerTask',
      resourceId: task.taskId
    });

    return task;
  }

  static async rejectTask(taskId: string, workerUser: any, reason: string) {
    const task = await WorkerTask.findOne({ taskId, workerId: workerUser._id });
    if (!task) throw new Error('Task not found.');

    task.status = TaskStatus.REJECTED;
    task.rejectionReason = reason;
    await task.save();

    // Notify Officer
    await NotificationService.send({
      recipientId: task.assignedById,
      title: 'Task Assignment Rejected',
      message: `Worker ${workerUser.name} could not accept task for ${task.complaintCode}: ${reason}`,
      type: 'TASK_ASSIGNED',
      relatedComplaintCode: task.complaintCode
    });

    return task;
  }

  static async startWork(taskId: string, workerUser: any, beforePhotos: string[]) {
    const task = await WorkerTask.findOne({ taskId, workerId: workerUser._id });
    if (!task) throw new Error('Task not found.');

    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = new Date();
    if (beforePhotos && beforePhotos.length > 0) {
      task.beforePhotos = [...task.beforePhotos, ...beforePhotos];
    }
    await task.save();

    // Update Complaint
    const complaint = await Complaint.findById(task.complaintId);
    if (complaint) {
      const oldStatus = complaint.status;
      complaint.status = ComplaintStatus.IN_PROGRESS;
      await complaint.save();

      await ComplaintUpdate.create({
        complaintId: complaint._id,
        previousStatus: oldStatus,
        newStatus: ComplaintStatus.IN_PROGRESS,
        changedById: workerUser._id,
        changedByName: workerUser.name,
        changedByRole: workerUser.role,
        message: 'Worker has started on-site resolution work.',
        proofImages: beforePhotos
      });

      // Notify citizen
      await NotificationService.send({
        recipientId: complaint.citizenId,
        title: 'Work In Progress',
        message: `Field worker ${workerUser.name} has begun work on your complaint ${complaint.complaintId}.`,
        type: 'COMPLAINT_UPDATE',
        relatedComplaintId: complaint._id,
        relatedComplaintCode: complaint.complaintId
      });
    }

    return task;
  }

  static async completeTask(
    taskId: string,
    workerUser: any,
    afterPhotos: string[],
    completionNotes: string,
    proofLocation?: { latitude: number; longitude: number }
  ) {
    const task = await WorkerTask.findOne({ taskId, workerId: workerUser._id });
    if (!task) throw new Error('Task not found.');

    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.afterPhotos = afterPhotos;
    task.completionNotes = completionNotes;
    if (proofLocation) {
      task.proofLocation = {
        latitude: proofLocation.latitude,
        longitude: proofLocation.longitude,
        recordedAt: new Date()
      };
    }
    await task.save();

    // Update Complaint to RESOLVED / CITIZEN_VERIFICATION_PENDING
    const complaint = await Complaint.findById(task.complaintId);
    if (complaint) {
      const oldStatus = complaint.status;
      complaint.status = ComplaintStatus.RESOLVED;
      complaint.resolvedAt = new Date();
      await complaint.save();

      await ComplaintUpdate.create({
        complaintId: complaint._id,
        previousStatus: oldStatus,
        newStatus: ComplaintStatus.RESOLVED,
        changedById: workerUser._id,
        changedByName: workerUser.name,
        changedByRole: workerUser.role,
        message: 'Field worker marked task as completed with proof of resolution.',
        notes: completionNotes,
        proofImages: afterPhotos,
        location: proofLocation
      });

      // MANDATORY STEP: Prompt citizen to verify resolution
      await NotificationService.send({
        recipientId: complaint.citizenId,
        title: 'Action Required: Verify Resolution',
        message: `Your complaint ${complaint.complaintId} has been marked as resolved. Please confirm whether the issue is actually fixed.`,
        type: 'TASK_RESOLVED',
        relatedComplaintId: complaint._id,
        relatedComplaintCode: complaint.complaintId
      });

      // Notify officer
      await NotificationService.send({
        recipientId: task.assignedById,
        title: 'Task Resolved by Worker',
        message: `Worker ${workerUser.name} marked ${complaint.complaintId} as resolved. Awaiting citizen confirmation.`,
        type: 'COMPLAINT_UPDATE',
        relatedComplaintId: complaint._id,
        relatedComplaintCode: complaint.complaintId
      });
    }

    return task;
  }
}
