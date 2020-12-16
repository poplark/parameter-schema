/**
 * @internal
 */
export function isNil(val: unknown): boolean {
  return val === null || val === undefined;
}

/**
 * @internal
 */
export function isValidString(val: unknown): boolean {
  if (Object.prototype.toString.call(val) === '[object String]') {
    return true;
  }
  return false;
}

/**
 * @internal
 */
export function isValidBoolean(val: unknown): boolean {
  if (Object.prototype.toString.call(val) === '[object Boolean]') {
    return true;
  }
  return false;
}

/**
 * @internal
 */
export function isValidNumber(val: unknown): boolean {
  if (Object.prototype.toString.call(val) !== '[object Number]') {
    return false;
  }
  return true;
}

/**
 * @internal
 */
export function isValidArray(val: unknown): boolean {
  if (Object.prototype.toString.call(val) !== '[object Array]') {
    return false;
  }
  return true;
}
