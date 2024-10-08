"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t = require('typy').default;
//
// Various shared utility functions.
//
function isObject(v) {
    return t(v).isObject && !isDate(v);
}
exports.isObject = isObject;
function isFunction(v) {
    return t(v).isFunction;
}
exports.isFunction = isFunction;
function isString(v) {
    return t(v).isString;
}
exports.isString = isString;
function isDate(v) {
    return Object.prototype.toString.call(v) === "[object Date]";
}
exports.isDate = isDate;
function isBoolean(v) {
    return t(v).isBoolean;
}
exports.isBoolean = isBoolean;
function isNumber(v) {
    return t(v).isNumber;
}
exports.isNumber = isNumber;
function isArray(v) {
    return t(v).isArray;
}
exports.isArray = isArray;
function isUndefined(v) {
    return v === undefined;
}
exports.isUndefined = isUndefined;
//# sourceMappingURL=utils.js.map