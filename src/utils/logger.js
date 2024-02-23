const winston = require("winston");
const DailyRotateFile = require('winston-daily-rotate-file');
const { combine, timestamp, json, errors } = winston.format;
const fileRotateTransport = new DailyRotateFile({
    filename: 'logs/bot/%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
  });
//todo use NODE_ENV to set log to console only if dev. log file will use only for prod
const loggerv1 = winston.createLogger({
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [
        new winston.transports.Console(),
        fileRotateTransport
    ]
});

function terminate ( options = { coredump: false, timeout: 500 }) {
    // Exit function
    const exit = code => {
      options.coredump ? process.abort() : process.exit(code)
    }
  
    return (code, reason) => (err, promise) => {
      if (err && err instanceof Error) {
        // Log error information, use a proper logging library here :)
        console.error(reason, err.message);
        loggerv1.error(err);
      }
  
      // Attempt a graceful shutdown
      setTimeout(exit.bind(null, code), options.timeout).unref()
    }
}
module.exports = {
    loggerv1,
    terminate,
}
