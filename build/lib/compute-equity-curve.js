"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const util_1 = require("util");
/**
 * Compute an equity curve for a series of trades.
 *
 * @param trades The series of trades to compute equity curve for.
 */
function computeEquityCurve(startingCapital, trades) {
    if (!utils_1.isNumber(startingCapital) || startingCapital <= 0) {
        throw new Error("Expected 'startingCapital' argument to 'computeEquityCurve' to be a positive number that specifies the amount of capital used to compute the equity curve.");
    }
    if (!util_1.isArray(trades)) {
        throw new Error("Expected 'trades' argument to 'computeEquityCurve' to be an array that contains a set of trades for which to compute the equity curve.");
    }
    const equityCurve = [startingCapital];
    let workingCapital = startingCapital;
    for (const trade of trades) {
        workingCapital *= trade.growth;
        equityCurve.push(workingCapital);
    }
    return equityCurve;
}
exports.computeEquityCurve = computeEquityCurve;
//# sourceMappingURL=compute-equity-curve.js.map