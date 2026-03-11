"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonConfig = void 0;
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
const maskSensitiveData = winston.format((info) => {
    const sensitiveKeys = ['password', 'otp', 'token', 'apiKey', 'api_key', 'apiSecret', 'secret'];
    const redact = (data) => {
        if (!data || typeof data !== 'object')
            return data;
        const shaded = Array.isArray(data) ? [...data] : { ...data };
        for (const key of Object.keys(shaded)) {
            if (sensitiveKeys.includes(key.toLowerCase()) || key.match(/pass/i)) {
                shaded[key] = '********';
            }
            else if (typeof shaded[key] === 'object' && shaded[key] !== null) {
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
exports.winstonConfig = {
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), maskSensitiveData(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, context, stack }) => {
                const strMsg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message;
                const ctx = context ? ` [\x1b[33m${context}\x1b[0m]` : '';
                const stk = stack ? `\n\x1b[31m${stack}\x1b[0m` : '';
                return `[Winston] ${timestamp} ${level}${ctx}: ${strMsg}${stk}`;
            })),
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(winston.format.timestamp(), maskSensitiveData(), winston.format.json()),
        }),
        new winston.transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            format: winston.format.combine(winston.format.timestamp(), maskSensitiveData(), winston.format.json()),
        }),
    ],
};
//# sourceMappingURL=winston.config.js.map