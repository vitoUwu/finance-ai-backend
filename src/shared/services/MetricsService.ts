import { LoggerService } from "./LoggerService.js";

interface JobMetrics {
  jobName: string;
  startTime: Date;
  endTime?: Date;
  success: boolean;
  error?: Error;
  metadata?: Record<string, any>;
}

export class MetricsService {
  private static metrics: JobMetrics[] = [];

  static startJob(jobName: string, metadata?: Record<string, any>): JobMetrics {
    const metric: JobMetrics = {
      jobName,
      startTime: new Date(),
      success: false,
      metadata,
    };

    this.metrics.push(metric);
    return metric;
  }

  static finishJob(metric: JobMetrics, success: boolean, error?: Error): void {
    metric.endTime = new Date();
    metric.success = success;
    metric.error = error;

    const duration = metric.endTime.getTime() - metric.startTime.getTime();

    LoggerService.info({
      message: `Job ${metric.jobName} finished`,
      metadata: {
        ...metric.metadata,
        duration: `${duration}ms`,
        success: metric.success,
      },
    });
  }

  static getJobStats(jobName: string): {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
  } {
    const jobMetrics = this.metrics.filter(
      (m) => m.jobName === jobName && m.endTime
    );
    const successfulRuns = jobMetrics.filter((m) => m.success);

    const durations = jobMetrics.map(
      (m) => m.endTime!.getTime() - m.startTime.getTime()
    );

    return {
      totalRuns: jobMetrics.length,
      successfulRuns: successfulRuns.length,
      failedRuns: jobMetrics.length - successfulRuns.length,
      averageDuration:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
    };
  }
}
