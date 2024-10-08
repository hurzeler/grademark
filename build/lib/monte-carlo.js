"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const random_1 = require("./random");
/**
 * Perform a monte carlo simulation on a set of trades.
 * Produces a set of X samples of Y trades from the full population.
 * X = numIterators.
 * Y = numSamples
 */
function monteCarlo(trades, numIterations, numSamples, options) {
    if (!utils_1.isArray(trades)) {
        throw new Error("Expected 'trades' argument to 'monteCarlo' to be an array that contains a population of trades to sample during monte carlo simulation.");
    }
    if (!utils_1.isNumber(numIterations) || numIterations < 1) {
        throw new Error("Expected 'numIterations' argument to 'monteCarlo' to be a number >= 1 that specifies the number of iteration of monte carlo simulation to perform.");
    }
    if (!utils_1.isNumber(numSamples) || numSamples < 1) {
        throw new Error("Expected 'numSamples' argument to 'monteCarlo' to be a number >= 1 that specifies the size of the sample to create for each iteration of the monte carlo simulation.");
    }
    const numTrades = trades.length;
    if (numTrades === 0) {
        return [];
    }
    const random = new random_1.Random(options && options.randomSeed || 0);
    const samples = [];
    for (let iterationIndex = 0; iterationIndex < numIterations; ++iterationIndex) {
        const sample = [];
        for (var tradeIndex = 0; tradeIndex < numSamples; ++tradeIndex) {
            var tradeCopyIndex = random.getInt(0, numTrades - 1);
            sample.push(trades[tradeCopyIndex]);
        }
        samples.push(sample);
    }
    return samples;
}
exports.monteCarlo = monteCarlo;
//# sourceMappingURL=monte-carlo.js.map