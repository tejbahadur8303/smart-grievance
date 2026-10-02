import cron from 'node-cron';
import { EscalationService } from '../services/escalation.service';

export function startEscalationCronJob(): cron.ScheduledTask {
  // Run every 2 minutes
  const task = cron.schedule('*/2 * * * *', async () => {
    try {
      console.log('[Escalation Cron] Scanning for SLA overdue complaints...');
      const result = await EscalationService.checkAndEscalateComplaints();
      if (result.escalatedCount > 0) {
        console.log(`[Escalation Cron] Escalated ${result.escalatedCount} complaints:`, result.escalatedComplaints);
      }
    } catch (err: any) {
      console.error('[Escalation Cron Error]:', err.message);
    }
  });

  console.log('[Scheduler] SLA auto-escalation cron job initialized (running every 2 minutes).');
  return task;
}
