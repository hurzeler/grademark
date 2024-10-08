"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const util_1 = require("util");
/**
 * Compute drawdown for a series of trades.
 *
 * @param trades The series of trades to compute drawdown for.
 */
function computeDrawdown(startingCapital, trades) {
    if (!utils_1.isNumber(startingCapital) || startingCapital <= 0) {
        throw new Error("Expected 'startingCapital' argument to 'computeDrawdown' to be a positive number that specifies the amount of capital used to compute drawdown.");
    }
    if (!util_1.isArray(trades)) {
        throw new Error("Expected 'trades' argument to 'computeDrawdown' to be an array that contains a set of trades for which to compute drawdown.");
    }
    const drawdown = [0];
    let workingCapital = startingCapital;
    let peakCapital = startingCapital;
    let workingDrawdown = 0;
    for (const trade of trades) {
        workingCapital *= trade.growth;
        if (workingCapital < peakCapital) {
            workingDrawdown = workingCapital - peakCapital;
        }
        else {
            peakCapital = workingCapital;
            workingDrawdown = 0; // Reset at the peak.
        }
        drawdown.push(workingDrawdown);
    }
    return drawdown;
}
exports.computeDrawdown = computeDrawdown;
//# sourceMappingURL=compute-drawdown.js.map