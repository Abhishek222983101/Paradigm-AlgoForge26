import { anonymizePatientData, generateSecureId } from "./hipaa";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "VIEW_PATIENT"
  | "VIEW_TRIAL"
  | "CREATE_MATCH"
  | "EXPORT_DATA"
  | "ANONYMIZE_DATA"
  | "ACCESS_DASHBOARD"
  | "SEARCH_TRIALS"
  | "FILTER_PATIENTS"
  | "UPDATE_SETTINGS"
  | "FAILED_LOGIN"
  | "SESSION_TIMEOUT";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "warning";
  details?: string;
  patientId?: string;
  trialId?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceReport {
  period: { start: string; end: string };
  totalActions: number;
  uniqueUsers: number;
  actionsByType: Record<AuditAction, number>;
  actionsByStatus: Record<string, number>;
  failedAttempts: number;
  dataExports: number;
  anonymizations: number;
  lastSecurityIncident?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000;

  private generateLogId(): string {
    return generateSecureId("AUDIT");
  }

  log(
    action: AuditAction,
    userId: string,
    userRole: string,
    options?: {
      resourceType?: string;
      resourceId?: string;
      status?: "success" | "failure" | "warning";
      details?: string;
      patientId?: string;
      trialId?: string;
      metadata?: Record<string, any>;
    }
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      status: options?.status || "success",
      ...options
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return entry;
  }

  getLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (filters?.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }
    if (filters?.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
    }
    if (filters?.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    return filtered;
  }

  getComplianceReport(startDate: string, endDate: string): ComplianceReport {
    const logs = this.getLogs({ startDate, endDate });

    const actionsByType: Record<AuditAction, number> = {} as Record<AuditAction, number>;
    const actionsByStatus: Record<string, number> = {};
    const uniqueUsers = new Set<string>();

    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      actionsByStatus[log.status] = (actionsByStatus[log.status] || 0) + 1;
      uniqueUsers.add(log.userId);
    });

    return {
      period: { start: startDate, end: endDate },
      totalActions: logs.length,
      uniqueUsers: uniqueUsers.size,
      actionsByType,
      actionsByStatus,
      failedAttempts: logs.filter(l => l.status === "failure").length,
      dataExports: logs.filter(l => l.action === "EXPORT_DATA").length,
      anonymizations: logs.filter(l => l.action === "ANONYMIZE_DATA").length
    };
  }

  getRecentActivity(limit: number = 10): AuditLogEntry[] {
    return this.logs.slice(0, limit);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLogger();

export function createAuditMiddleware() {
  return (req: Request, userId: string, userRole: string) => {
    const url = req.url;
    const method = req.method;

    if (url.includes("/api/")) {
      let action: AuditAction = "ACCESS_DASHBOARD";
      
      if (url.includes("/api/anonymize")) action = "ANONYMIZE_DATA";
      else if (url.includes("/api/match")) action = "CREATE_MATCH";
      else if (url.includes("/api/trials")) action = "SEARCH_TRIALS";
      else if (url.includes("/api/patients")) action = "FILTER_PATIENTS";
      else if (url.includes("/api/export")) action = "EXPORT_DATA";
      else if (method === "POST" && url.includes("/login")) action = "LOGIN";
      else if (method === "POST" && url.includes("/logout")) action = "LOGOUT";

      auditLogger.log(action, userId, userRole, {
        details: `${method} ${url}`,
        status: "success"
      });
    }
  };
}
