// ==========================================
// PHASE 1: LOGGING & MONITORING INFRASTRUCTURE
// ==========================================

import { storage } from '../storage';
import type { InsertAuditLog } from '@shared/schema';

/**
 * Logger utility for consistent application logging
 */
export class Logger {
  private context: string;
  private enabledLevels: Set<string>;

  constructor(context: string) {
    this.context = context;
    const logLevel = process.env.LOG_LEVEL || 'info';
    this.enabledLevels = this.getEnabledLevels(logLevel);
  }

  private getEnabledLevels(level: string): Set<string> {
    const levels = ['debug', 'info', 'warn', 'error'];
    const index = levels.indexOf(level);
    return new Set(levels.slice(index >= 0 ? index : 1));
  }

  private shouldLog(level: string): boolean {
    return this.enabledLevels.has(level);
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, error?: any, meta?: any) {
    if (this.shouldLog('error')) {
      const errorDetails = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : error;
      console.error(this.formatMessage('error', message, { ...meta, error: errorDetails }));
    }
  }
}

/**
 * Audit logger for security and compliance
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private logger: Logger;
  private enabled: boolean;

  private constructor() {
    this.logger = new Logger('AuditLogger');
    this.enabled = process.env.ENABLE_AUDIT_LOGGING === 'true';
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(auditData: Omit<InsertAuditLog, 'status'> & { status?: string }) {
    if (!this.enabled) {
      return;
    }

    try {
      const logEntry: InsertAuditLog = {
        ...auditData,
        status: auditData.status || 'success',
      };

      // Save to database
      await storage.createAuditLog(logEntry);

      // Also log to console for immediate visibility
      this.logger.info('Audit event', {
        action: logEntry.action,
        userId: logEntry.userId,
        entityType: logEntry.entityType,
        status: logEntry.status,
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  async logUserAction(
    userId: string,
    action: string,
    details: {
      entityType?: string;
      entityId?: string;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      metadata?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
    }
  ) {
    await this.log({
      userId,
      action,
      ...details,
      status: 'success',
    });
  }

  async logSecurityEvent(
    action: string,
    details: {
      userId?: string;
      userEmail?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, any>;
      status?: 'success' | 'failed';
      errorMessage?: string;
    }
  ) {
    await this.log({
      action,
      ...details,
      status: details.status || 'success',
    });
  }

  async logPaymentEvent(
    userId: string,
    action: string,
    details: {
      amount?: number;
      currency?: string;
      provider?: string;
      transactionId?: string;
      status?: 'success' | 'failed';
      errorMessage?: string;
      metadata?: Record<string, any>;
    }
  ) {
    await this.log({
      userId,
      action,
      entityType: 'payment',
      ...details,
      status: details.status || 'success',
    });
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  private logger: Logger;
  private enabled: boolean;

  constructor(context: string) {
    this.logger = new Logger(`PerfMon:${context}`);
    this.enabled = process.env.ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  startTimer(operationId: string): void {
    if (!this.enabled) return;
    PerformanceMonitor.timers.set(operationId, Date.now());
  }

  endTimer(operationId: string, metadata?: any): number {
    if (!this.enabled) return 0;

    const startTime = PerformanceMonitor.timers.get(operationId);
    if (!startTime) {
      this.logger.warn(`No timer found for operation: ${operationId}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    PerformanceMonitor.timers.delete(operationId);

    this.logger.info(`Operation completed: ${operationId}`, {
      durationMs: duration,
      ...metadata,
    });

    return duration;
  }

  async measure<T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const operationId = `${operationName}_${Date.now()}`;
    this.startTimer(operationId);

    try {
      const result = await operation();
      this.endTimer(operationId, { ...metadata, status: 'success' });
      return result;
    } catch (error) {
      this.endTimer(operationId, { ...metadata, status: 'error', error });
      throw error;
    }
  }
}

/**
 * Error tracker utility
 */
export class ErrorTracker {
  private static logger = new Logger('ErrorTracker');
  private static enabled = process.env.ENABLE_ERROR_TRACKING === 'true';

  static capture(error: Error, context?: {
    userId?: string;
    requestPath?: string;
    metadata?: Record<string, any>;
  }) {
    if (!this.enabled) return;

    this.logger.error('Application error', error, {
      userId: context?.userId,
      path: context?.requestPath,
      metadata: context?.metadata,
    });

    // Here you could integrate with Sentry or other error tracking services
    // if (process.env.SENTRY_DSN) {
    //   Sentry.captureException(error, {
    //     user: context?.userId ? { id: context.userId } : undefined,
    //     tags: { path: context?.requestPath },
    //     extra: context?.metadata,
    //   });
    // }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', metadata?: any) {
    if (!this.enabled) return;

    this.logger[level === 'warning' ? 'warn' : level](message, metadata);

    // Integrate with external error tracking if needed
  }
}

// Export instances for common use
export const auditLogger = AuditLogger.getInstance();
export const createLogger = (context: string) => new Logger(context);
export const createPerformanceMonitor = (context: string) => new PerformanceMonitor(context);
