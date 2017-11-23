/**
 * Helpers.
 */

const s = 1000
const m = s * 60
const h = m * 60
const d = h * 24
const y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

function ms(val: string): number;
function ms(val: number, options?: any): string

function ms(val, options?) {
  options = options || {}
  if (typeof val === 'string' && val.length > 0) {
    return parse(val)
  } else if (typeof val === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val)
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  )
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str): number {
  str = String(str)
  if (str.length > 100) {
    return
  }
  const match =
  /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  )
  if (!match) {
    return
  }
  const n = parseFloat(match[1])
  const type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} mills
 * @return {String}
 * @api private
 */

function fmtShort(mills): string {
  if (mills >= d) {
    return Math.round(mills / d) + 'd'
  }
  if (mills >= h) {
    return Math.round(mills / h) + 'h'
  }
  if (mills >= m) {
    return Math.round(mills / m) + 'm'
  }
  if (mills >= s) {
    return Math.round(mills / s) + 's'
  }
  return mills + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} mills
 * @return {String}
 * @api private
 */

function fmtLong(mills): string {
  return (
    plural(mills, d, 'day') ||
    plural(mills, h, 'hour') ||
    plural(mills, m, 'minute') ||
    plural(mills, s, 'second') ||
    mills + ' ms'
  )
}

/**
 * Pluralization helper.
 */

function plural(mills, n, name) {
  if (mills < n) {
    return
  }
  if (mills < n * 1.5) {
    return Math.floor(mills / n) + ' ' + name
  }
  return Math.ceil(mills / n) + ' ' + name + 's'
}

export { ms }
