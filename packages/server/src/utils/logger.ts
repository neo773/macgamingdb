import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export function createLogger(name?: string) {
  return pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    ...(name && { name }),
    ...(!isProduction && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    }),
  });
}

export const logger = createLogger();
