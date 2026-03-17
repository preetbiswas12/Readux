/**
 * Project Aegis - Error Logging Service
 * Handles local crash logs, error tracking, and diagnostic logging
 */

import { SQLiteService } from './SQLiteService';

export interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info' | 'debug';
  category: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface CrashReport {
  id: string;
  timestamp: number;
  error: string;
  stack: string;
  context: Record<string, any>;
  userAlias?: string;
  appVersion: string;
  timestamp_formatted: string;
}

class ErrorLoggingService {
  private logs: ErrorLog[] = [];
  private crashReports: CrashReport[] = [];
  private maxLogs = 1000;
  private debugEnabled = false;
  private readonly APP_VERSION = '1.0.0-phase4.2';

  /**
   * Initialize error logging service
   */
  async initialize(): Promise<void> {
    console.log('[ErrorLogging] Initializing error logging service...');
    try {
      // Load existing logs from database
      await this.loadLogsFromDatabase();
      console.log('[ErrorLogging] ✅ Initialized');
    } catch (error) {
      console.error('[ErrorLogging] Failed to initialize:', error);
    }
  }

  /**
   * Log an error with full context
   */
  logError(
    category: string,
    message: string,
    error?: Error,
    context?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: 'error',
      category,
      message,
      stack: error?.stack,
      context,
    };

    this.addLog(errorLog);
    console.error(`[${category}] ${message}`, error, context);
  }

  /**
   * Log a warning
   */
  logWarning(
    category: string,
    message: string,
    context?: Record<string, any>
  ): void {
    const warningLog: ErrorLog = {
      id: `warn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: 'warning',
      category,
      message,
      context,
    };

    this.addLog(warningLog);
    console.warn(`[${category}] ${message}`, context);
  }

  /**
   * Log info message (debug level)
   */
  logInfo(
    category: string,
    message: string,
    context?: Record<string, any>
  ): void {
    if (!this.debugEnabled) return;

    const infoLog: ErrorLog = {
      id: `info-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: 'info',
      category,
      message,
      context,
    };

    this.addLog(infoLog);
    console.log(`[${category}] ${message}`, context);
  }

  /**
   * Record a crash report
   */
  logCrash(
    error: Error,
    context?: Record<string, any>,
    userAlias?: string
  ): CrashReport {
    const report: CrashReport = {
      id: `crash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack || 'No stack trace',
      context: context || {},
      userAlias,
      appVersion: this.APP_VERSION,
      timestamp_formatted: new Date().toISOString(),
    };

    this.crashReports.push(report);
    
    // Keep only recent crash reports
    if (this.crashReports.length > 50) {
      this.crashReports = this.crashReports.slice(-50);
    }

    // Save to database
    this.saveCrashReport(report).catch(err => {
      console.error('[ErrorLogging] Failed to save crash report:', err);
    });

    console.error(
      '[ErrorLogging] 💥 Crash report created:',
      report.id,
      error
    );

    return report;
  }

  /**
   * Add log to in-memory store
   */
  private addLog(log: ErrorLog): void {
    this.logs.push(log);

    // Prevent unbounded memory growth
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Optionally save to database (async)
    if (log.level === 'error' || log.level === 'warning') {
      this.saveLogToDatabase(log).catch(err => {
        console.error('[ErrorLogging] Failed to save log:', err);
      });
    }
  }

  /**
   * Get all logs (optionally filtered)
   */
  getLogs(category?: string, level?: ErrorLog['level']): ErrorLog[] {
    let filtered = this.logs;

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered;
  }

  /**
   * Get all crash reports
   */
  getCrashReports(): CrashReport[] {
    return [...this.crashReports];
  }

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 100): ErrorLog[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('[ErrorLogging] All logs cleared');
  }

  /**
   * Clear all crash reports
   */
  clearCrashReports(): void {
    this.crashReports = [];
    console.log('[ErrorLogging] All crash reports cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        app_version: this.APP_VERSION,
        logs: this.logs,
        crash_reports: this.crashReports,
      },
      null,
      2
    );
  }

  /**
   * Export logs for text display
   */
  exportLogsAsText(): string {
    const lines: string[] = [
      `=== AEGIS CHAT ERROR EXPORT ===`,
      `Exported: ${new Date().toISOString()}`,
      `App Version: ${this.APP_VERSION}`,
      `Total Logs: ${this.logs.length}`,
      `Crash Reports: ${this.crashReports.length}`,
      ``,
      `--- RECENT LOGS (Last 50) ---`,
      ...this.getRecentLogs(50).map(
        log =>
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] [${
            log.category
          }] ${log.message}`
      ),
      ``,
      `--- CRASH REPORTS ---`,
      ...this.crashReports.map(
        report =>
          `[${report.timestamp_formatted}] ${report.error}\n${report.stack}`
      ),
    ];

    return lines.join('\n');
  }

  /**
   * Enable debug logging
   */
  setDebugMode(enabled: boolean): void {
    this.debugEnabled = enabled;
    console.log(`[ErrorLogging] Debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.debugEnabled;
  }

  /**
   * Get diagnostic summary
   */
  getDiagnosticSummary(): Record<string, any> {
    const errorCount = this.logs.filter(l => l.level === 'error').length;
    const warningCount = this.logs.filter(l => l.level === 'warning').length;

    return {
      app_version: this.APP_VERSION,
      debug_enabled: this.debugEnabled,
      total_logs: this.logs.length,
      error_count: errorCount,
      warning_count: warningCount,
      crash_count: this.crashReports.length,
      logs_by_category: this.getLogsByCategory(),
      timestamp: Date.now(),
    };
  }

  /**
   * Get logs grouped by category
   */
  private getLogsByCategory(): Record<string, number> {
    const categories: Record<string, number> = {};

    for (const log of this.logs) {
      categories[log.category] = (categories[log.category] || 0) + 1;
    }

    return categories;
  }

  /**
   * Save log to database (async)
   */
  private async saveLogToDatabase(log: ErrorLog): Promise<void> {
    try {
      // Store in SQLite for persistence
      await SQLiteService.saveAppState(
        `error_log_${log.id}`,
        JSON.stringify(log)
      );
    } catch (error) {
      // Silently fail - don't cause cascading errors
      console.error('[ErrorLogging] Failed to persist log:', error);
    }
  }

  /**
   * Save crash report to database
   */
  private async saveCrashReport(report: CrashReport): Promise<void> {
    try {
      await SQLiteService.saveAppState(
        `crash_report_${report.id}`,
        JSON.stringify(report)
      );
    } catch (error) {
      console.error('[ErrorLogging] Failed to persist crash report:', error);
    }
  }

  /**
   * Load logs from database on startup
   */
  private async loadLogsFromDatabase(): Promise<void> {
    try {
      // Load persisted logs (simplified - in production would query properly)
      console.log('[ErrorLogging] Loading persisted logs...');
    } catch (error) {
      console.error('[ErrorLogging] Failed to load logs:', error);
    }
  }
}

export default new ErrorLoggingService();
