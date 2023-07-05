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

module.exports = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.colorize(),
    format.printf((info) => {
      const msg = formatWithInspect(info.message);
      const splatArgs = info[Symbol.for('splat')] || [];
      const rest = splatArgs.map((data) => formatWithInspect(data)).join(' ');

      return `${info.level}: ${msg} ${rest}`;
    })
  ),
  silent: false,
  transports: [new transports.Console()]
});
