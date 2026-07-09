import pino, { type Logger as PinoLogger } from 'pino';

export interface Logger {
  log(message: string, context?: Record<string, unknown>): void;
  error(message: string, trace?: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  verbose(message: string, context?: Record<string, unknown>): void;
}

export function createLogger(context?: string): Logger {
  const pinoLogger: PinoLogger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: context ? `[${context}] {msg}` : '{msg}',
      },
    },
  });

  return {
    log(message: string, ctx?: Record<string, unknown>) {
      pinoLogger.info(ctx || {}, message);
    },
    error(message: string, trace?: string, ctx?: Record<string, unknown>) {
      pinoLogger.error({ ...ctx, trace }, message);
    },
    warn(message: string, ctx?: Record<string, unknown>) {
      pinoLogger.warn(ctx || {}, message);
    },
    debug(message: string, ctx?: Record<string, unknown>) {
      pinoLogger.debug(ctx || {}, message);
    },
    verbose(message: string, ctx?: Record<string, unknown>) {
      pinoLogger.trace(ctx || {}, message);
    },
  };
}

export const logger = createLogger();
