import * as winston from 'winston';
import 'winston-daily-rotate-file';

// 🔍 Redact Sensitive Fields Format
const maskSensitiveData = winston.format((info) => {
  const sensitiveKeys = [
    'password',
    'otp',
    'token',
    'apiKey',
    'api_key',
    'apiSecret',
    'secret',
  ];

  const redact = (data: any): any => {
    if (!data || typeof data !== 'object') return data;

    const shaded = Array.isArray(data) ? [...data] : { ...data };
    for (const key of Object.keys(shaded)) {
      if (sensitiveKeys.includes(key.toLowerCase()) || key.match(/pass/i)) {
        shaded[key] = '********';
      } else if (typeof shaded[key] === 'object' && shaded[key] !== null) {
        shaded[key] = redact(shaded[key]);
      }
    }
    return shaded;
  };

  if (typeof info.message === 'object') {
    info.message = redact(info.message);
  }

  return info;
});

export const winstonConfig = {
  transports: [
    // 1. Console transport (pretty printing)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        maskSensitiveData(),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, stack }) => {
            const strMsg =
              typeof message === 'object'
                ? JSON.stringify(message, null, 2)
                : message;
            const ctx = context ? ` [\x1b[33m${context}\x1b[0m]` : '';
            const stk = stack ? `\n\x1b[31m${stack}\x1b[0m` : '';
            return `[Winston] ${timestamp} ${level}${ctx}: ${strMsg}${stk}`;
          },
        ),
      ),
    }),

    // 2. Rolling File transport (Production only or all info)
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        maskSensitiveData(),
        winston.format.json(),
      ),
    }),

    // 3. Rolling Error File transport
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        maskSensitiveData(),
        winston.format.json(),
      ),
    }),
  ],
};
