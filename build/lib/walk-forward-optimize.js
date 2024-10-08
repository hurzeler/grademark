"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backtest_1 = require("./backtest");
const optimize_1 = require("./optimize");
const utils_1 = require("./utils");
const random_1 = require("./random");
/**
 * Perform a walk-forward optimization over a single parameter.
 */
function walkForwardOptimize(strategy, parameters, objectiveFn, inputSeries, inSampleSize, outSampleSize, options) {
    if (!utils_1.isObject(strategy)) {
        throw new Error("Expected 'strategy' argument to 'walkForwardOptimize' to be an object that defines the trading strategy for to do the walk-forward optimization.");
    }
    if (!utils_1.isArray(parameters) || parameters.length <= 0) {
        throw new Error("Expected 'parameters' argument to 'walkForwardOptimize' to be an array that specifies the strategy parameters that are to be optimized.");
    }
    if (!utils_1.isFunction(objectiveFn)) {
        throw new Error("Expected 'objectiveFn' argument to 'walkForwardOptimize' to be a function that computes an objective function for a set of trades.");
    }
    if (!utils_1.isObject(inputSeries) && inputSeries.count() > 0) {
        throw new Error("Expected 'inputSeries' argument to 'walkForwardOptimize' to be a Data-Forge DataFrame object that provides the input data for optimization.");
    }
    if (!utils_1.isNumber(inSampleSize) || inSampleSize <= 0) {
        throw new Error("Expected 'inSampleSize' argument to 'walkForwardOptimize' to be a positive number that specifies the amount of data to use for the in-sample data set (the training data).");
    }
    if (!utils_1.isNumber(outSampleSize) || outSampleSize <= 0) {
        throw new Error("Expected 'outSampleSize' argument to 'walkForwardOptimize' to be a positive number that specifies the amount of data to use for the out-of-sample data set (the testing data).");
    }
    if (!options) {
        options = {};
    }
    else {
        options = Object.assign({}, options); // Copy so we can change.
    }
    if (options.searchDirection === undefined) {
        options.searchDirection = "max";
    }
    const random = new random_1.Random(options.randomSeed || 0);
    let workingDataOffset = 0;
    let trades = [];
    while (true) {
        const inSampleSeries = inputSeries.skip(workingDataOffset).take(inSampleSize).bake();
        const outSampleSeries = inputSeries.skip(workingDataOffset + inSampleSize).take(outSampleSize).bake();
        if (outSampleSeries.count() < outSampleSize) {
            break; // No more data.
        }
        //
        // Choose a random seed for this iteration of optimziation.
        //
        options.randomSeed = random.getReal();
        //
        // Optimize using in sample data.
        //
        const optimizeResult = optimize_1.optimize(strategy, parameters, objectiveFn, inSampleSeries, options);
        //
        // Construct a strategy using the optimal parameter values.
        //
        const strategyClone = Object.assign({}, strategy);
        strategyClone.parameters = Object.assign({}, strategy.parameters, optimizeResult.bestParameterValues);
        //
        // Backtest optimized strategy on out of sample data.
        //
        const outSampleTrades = backtest_1.backtest(strategyClone, outSampleSeries);
        //
        // Accumulate trades from out of sample data.
        //
        trades = trades.concat(outSampleTrades);
        //
        // Move forward to the next out of sample section and repeat.
        //
        workingDataOffset += outSampleSize;
    }
    return {
        trades: trades,
    };
}
exports.walkForwardOptimize = walkForwardOptimize;
//# sourceMappingURL=walk-forward-optimize.js.map