import winston from 'winston';

const format = winston.format.printf(({level, message, timestamp}) => {
    return `${timestamp} ${level.toUpperCase().padEnd(5, ' ')} ${message}`;
});

export = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp(), format),
    transports: [
        new winston.transports.Console()
    ]
});
