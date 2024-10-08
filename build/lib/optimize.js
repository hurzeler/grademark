"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const backtest_1 = require("./backtest");
const utils_1 = require("./utils");
const random_1 = require("./random");
//
// Performs a single iteration of optimization and returns the result.
//
function optimizationIteration(strategy, parameters, objectiveFn, inputSeries, coordinates) {
    const parameterOverride = {};
    for (let parameterIndex = 0; parameterIndex < parameters.length; ++parameterIndex) {
        const parameter = parameters[parameterIndex];
        parameterOverride[parameter.name] = coordinates[parameterIndex];
    }
    const strategyClone = Object.assign({}, strategy);
    strategyClone.parameters = Object.assign({}, strategy.parameters, parameterOverride);
    const trades = backtest_1.backtest(strategyClone, inputSeries);
    return {
        metric: objectiveFn(trades),
        numTrades: trades.length,
    };
}
//
// Get neighbours of a particular set of coordinates.
//
function* getNeighbours(coordinates, parameters) {
    // 
    // Step forward.
    //
    for (let i = 0; i < parameters.length; ++i) {
        const nextCoordinate = coordinates[i] += parameters[i].stepSize;
        if (nextCoordinate <= parameters[i].endingValue) {
            const nextCoordinates = coordinates.slice(); // Clone.
            nextCoordinates[i] = nextCoordinate;
            yield nextCoordinates;
        }
    }
    // 
    // Step backward.
    //
    for (let i = 0; i < parameters.length; ++i) {
        const nextCoordinate = coordinates[i] -= parameters[i].stepSize;
        if (nextCoordinate >= parameters[i].startingValue) {
            const nextCoordinates = coordinates.slice(); // Clone.
            nextCoordinates[i] = nextCoordinate;
            yield nextCoordinates;
        }
    }
}
//
// Extracts parameter values from the coordinate system.
//
function extractParameterValues(parameters, workingCoordinates) {
    const bestParameterValues = {};
    for (let parameterIndex = 0; parameterIndex < parameters.length; ++parameterIndex) {
        const parameter = parameters[parameterIndex];
        bestParameterValues[parameter.name] = workingCoordinates[parameterIndex];
    }
    return bestParameterValues;
}
//
// Packages the results of an iteration.
//
function packageIterationResult(parameters, workingCoordinates, result) {
    const iterationResult = Object.assign({}, extractParameterValues(parameters, workingCoordinates), {
        result: result.metric,
        numTrades: result.numTrades,
    });
    return iterationResult;
}
//
// Returns true to accept the current result or false to discard.
//
function acceptResult(workingResult, nextResult, options) {
    if (options.searchDirection === "max") {
        if (nextResult > workingResult) { // Looking for maximum value.
            return true;
        }
    }
    else {
        if (nextResult < workingResult) { // Looking for minimum value.
            return true;
        }
    }
    return false;
}
//
// Iterate a dimension in coordinate space.
//
function* iterateDimension(workingCoordinates, parameterIndex, parameters) {
    const parameter = parameters[parameterIndex];
    for (let parameterValue = parameter.startingValue; parameterValue <= parameter.endingValue; parameterValue += parameter.stepSize) {
        const coordinatesHere = [...workingCoordinates, parameterValue];
        if (parameterIndex < parameters.length - 1) {
            //
            // Recurse to higher dimensions.
            //
            for (const coordinates of iterateDimension(coordinatesHere, parameterIndex + 1, parameters)) {
                yield coordinates;
            }
        }
        else {
            //
            // At the bottommost dimension.
            // This is where we produce coordinates.
            //
            yield coordinatesHere;
        }
    }
}
//
// Get all coordinates in a particular coordinate space.
//
function* getAllCoordinates(parameters) {
    for (const coordinates of iterateDimension([], 0, parameters)) {
        yield coordinates;
    }
}
//
// Performs a fast but non-exhaustive hill climb optimization.
//
function hillClimbOptimization(strategy, parameters, objectiveFn, inputSeries, options) {
    let bestResult;
    let bestCoordinates;
    const results = [];
    const startTime = Date.now();
    const visitedCoordinates = new Map(); // Tracks coordinates that we have already visited and their value.
    const random = new random_1.Random(options.randomSeed || 0);
    const numStartingPoints = options.numStartingPoints || 4;
    for (let startingPointIndex = 0; startingPointIndex < numStartingPoints; ++startingPointIndex) {
        //
        // Compute starting coordinates for this section.
        //
        let workingCoordinates = [];
        for (const parameter of parameters) {
            const randomIncrement = random.getInt(0, (parameter.endingValue - parameter.startingValue) / parameter.stepSize);
            const randomCoordinate = parameter.startingValue + randomIncrement * parameter.stepSize;
            workingCoordinates.push(randomCoordinate);
        }
        if (visitedCoordinates.has(workingCoordinates)) {
            // Already been here!
            continue;
        }
        let workingResult = optimizationIteration(strategy, parameters, objectiveFn, inputSeries, workingCoordinates);
        visitedCoordinates.set(workingCoordinates, workingResult);
        if (bestResult === undefined) {
            bestResult = workingResult.metric;
            bestCoordinates = workingCoordinates;
        }
        else if (acceptResult(bestResult, workingResult.metric, options)) {
            bestResult = workingResult.metric;
            bestCoordinates = workingCoordinates;
        }
        if (options.recordAllResults) {
            results.push(packageIterationResult(parameters, workingCoordinates, workingResult));
        }
        while (true) {
            let gotBetterResult = false;
            //
            // Visit all neighbouring coordinates.
            //
            let nextCoordinates;
            for (nextCoordinates of getNeighbours(workingCoordinates, parameters)) {
                const cachedResult = visitedCoordinates.get(workingCoordinates);
                const nextResult = cachedResult !== undefined ? cachedResult : optimizationIteration(strategy, parameters, objectiveFn, inputSeries, nextCoordinates);
                if (options.recordAllResults) {
                    results.push(packageIterationResult(parameters, workingCoordinates, workingResult));
                }
                if (acceptResult(bestResult, workingResult.metric, options)) {
                    bestResult = workingResult.metric;
                    bestCoordinates = workingCoordinates;
                }
                if (acceptResult(workingResult.metric, nextResult.metric, options)) {
                    workingCoordinates = nextCoordinates;
                    workingResult = nextResult;
                    gotBetterResult = true;
                    break; // Move to this neighbour and start again.
                }
            }
            if (!gotBetterResult) {
                // There is no better neighbour, break out.
                break;
            }
        }
    }
    return {
        bestResult: bestResult,
        bestParameterValues: extractParameterValues(parameters, bestCoordinates),
        durationMS: options.recordDuration ? (Date.now() - startTime) : undefined,
        allResults: options.recordAllResults ? results : undefined,
    };
}
//
// Performs a slow exhaustive grid search optimization.
//
function gridSearchOptimization(strategy, parameters, objectiveFn, inputSeries, options) {
    let bestResult;
    let bestCoordinates;
    const results = [];
    const startTime = Date.now();
    for (const coordinates of getAllCoordinates(parameters)) {
        const iterationResult = optimizationIteration(strategy, parameters, objectiveFn, inputSeries, coordinates);
        if (bestResult === undefined) {
            bestResult = iterationResult.metric;
            bestCoordinates = coordinates;
        }
        else if (acceptResult(bestResult, iterationResult.metric, options)) {
            bestResult = iterationResult.metric;
            bestCoordinates = coordinates;
        }
        if (options.recordAllResults) {
            results.push(packageIterationResult(parameters, coordinates, iterationResult));
        }
    }
    return {
        bestResult: bestResult,
        bestParameterValues: extractParameterValues(parameters, bestCoordinates),
        durationMS: options.recordDuration ? (Date.now() - startTime) : undefined,
        allResults: options.recordAllResults ? results : undefined,
    };
}
/**
 * Perform an optimization over multiple parameters.
 */
function optimize(strategy, parameters, objectiveFn, inputSeries, options) {
    if (!utils_1.isObject(strategy)) {
        throw new Error("Expected 'strategy' argument to 'optimize' to be an object that defines the trading strategy to be optimized.");
    }
    if (!utils_1.isArray(parameters)) {
        throw new Error("Expected 'parameters' argument to 'optimize' to be an array that defines the various strategy parameters to be optimized.");
    }
    if (!utils_1.isFunction(objectiveFn)) {
        throw new Error("Expected 'objectiveFn' argument to 'optimize' to be a function that computes an objective function for a set of trades.");
    }
    if (!utils_1.isObject(inputSeries)) {
        throw new Error("Expected 'inputSeries' argument to 'optimize' to be a Data-Forge DataFrame object that provides the input data for optimization.");
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
    if (options.optimizationType === undefined) {
        options.optimizationType = "grid";
    }
    if (options.optimizationType === "hill-climb") {
        return hillClimbOptimization(strategy, parameters, objectiveFn, inputSeries, options);
    }
    else if (options.optimizationType === "grid") {
        return gridSearchOptimization(strategy, parameters, objectiveFn, inputSeries, options);
    }
    else {
        throw new Error(`Unexpected "optimizationType" field of "options" parameter to the "optimize" function. Expected "grid", or "hill-climb", Actual: "${options.optimizationType}".`);
    }
}
exports.optimize = optimize;
//# sourceMappingURL=optimize.js.map