const winston = require('winston');
const { combine, timestamp, printf, colorize, align } = winston.format;

module.exports = winston.createLogger({
    level: 'info',
    format: combine(
        colorize({ all: true }),
        timestamp({
            format: 'DD-MM-YYYY HH:mm:ss.SSS A',
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console()]
})