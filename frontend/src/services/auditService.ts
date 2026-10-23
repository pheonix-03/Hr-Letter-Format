// ============================================================
// Audit Service – HR Letter Generator
// ============================================================
import { db, generateId, getCurrentTimestamp } from '../store/db';
import type { AuditAction, AuditLog } from '../types';

export async function logAction(
  companyId: string,
  userId: string,
  userName: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  details: Record<string, any> = {},
): Promise<void> {
  try {
    const log: AuditLog = {
      id: generateId(),
      companyId: companyId || 'system',
      userId: userId || 'anonymous',
      userName: userName || 'System User',
      action,
      entityType,
      entityId,
      details,
      ipAddress: '127.0.0.1 (local)',
      timestamp: getCurrentTimestamp(),
    };
    await db.auditLogs.add(log);
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export async function getAuditLogs(
  companyId?: string,
  filters?: {
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<AuditLog[]> {
  let query = db.auditLogs.toCollection();

  if (companyId) {
    query = db.auditLogs.where('companyId').equals(companyId);
  }

  let logs = await query.reverse().sortBy('timestamp');

  if (filters?.entityType) {
    logs = logs.filter((log) => log.entityType === filters.entityType);
  }
  if (filters?.action) {
    logs = logs.filter((log) => log.action === filters.action);
  }
  if (filters?.startDate) {
    logs = logs.filter((log) => log.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    logs = logs.filter((log) => log.timestamp <= filters.endDate!);
  }

  return logs;
}
