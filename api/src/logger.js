const { createLogger, format, transports } = require('winston');
const { inspect } = require('util');
import { logLevel } from './lib/config';

function isPrimitive(val) {
  const type = typeof value;
  return val === null || (type !== 'object' && type !== 'function');
}

function formatWithInspect(val) {
  const prefix = isPrimitive(val) ? '' : '\n';
  const shouldFormat = typeof val !== 'string';

  return prefix + (shouldFormat ? inspect(val, { depth: null, colors: true }) : val);
}

// log levels based on priority
// https://github.com/winstonjs/winston#logging-levels
//const logLevel = config.get('logLevel');

module.exports = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.errors({ stack: true }),
    // format.colorize(),
    format.prettyPrint(),
    format.printf((info) => {
      const data = info.message;
      const msg = formatWithInspect(data.msg);
      const id = data.user ? data.user._id : null;
      const logger = {
        level: info.level,
        id: id,
        url: data.url,
        method: data.method,
        context: {
          body: data.context,
          message: msg,
          data: data.data
        },
        ip: data.ip,
        service: 'api',
        status: data.status,
        timestamp: info.timestamp
      };
      return JSON.stringify(logger);
    })
  ),
  silent: false,
  transports: [new transports.Console()]
});
