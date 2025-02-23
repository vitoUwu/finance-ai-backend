type LogLevel = "info" | "warn" | "error" | "debug";

interface LogData {
  message: string;
  error?: Error;
  metadata?: Record<string, any>;
}

export class LoggerService {
  private static formatLog(
    level: LogLevel,
    { message, error, metadata }: LogData
  ): string {
    const timestamp = new Date().toISOString();
    const logParts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      message,
      metadata ? `metadata: ${JSON.stringify(metadata)}` : "",
      error ? `\nerror: ${error.message}\nstack: ${error.stack}` : "",
    ];

    return logParts.filter(Boolean).join(" ");
  }

  static info(data: LogData): void {
    console.log(this.formatLog("info", data));
  }

  static warn(data: LogData): void {
    console.warn(this.formatLog("warn", data));
  }

  static error(data: LogData): void {
    console.error(this.formatLog("error", data));
  }

  static debug(data: LogData): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatLog("debug", data));
    }
  }
}
