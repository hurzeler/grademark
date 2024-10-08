"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math = require("mathjs");
const utils_1 = require("./utils");
const data_forge_1 = require("data-forge");
/**
 * Analyse a sequence of trades and compute their performance.
 */
function analyze(startingCapital, trades) {
    if (!utils_1.isNumber(startingCapital) || startingCapital <= 0) {
        throw new Error("Expected 'startingCapital' argument to 'analyze' to be a positive number that specifies the amount of capital used to simulate trading.");
    }
    if (!utils_1.isArray(trades)) {
        throw new Error("Expected 'trades' argument to 'analyze' to be an array that contains a set of trades to be analyzed.");
    }
    let workingCapital = startingCapital;
    let barCount = 0;
    let peakCapital = startingCapital;
    let workingDrawdown = 0;
    let maxDrawdown = 0;
    let maxDrawdownPct = 0;
    let totalProfits = 0;
    let totalLosses = 0;
    let numWinningTrades = 0;
    let numLosingTrades = 0;
    let totalTrades = 0;
    let maxRiskPct = undefined;
    for (const trade of trades) {
        ++totalTrades;
        if (trade.riskPct !== undefined) {
            maxRiskPct = Math.max(trade.riskPct, maxRiskPct || 0);
        }
        workingCapital *= trade.growth;
        barCount += trade.holdingPeriod;
        if (workingCapital < peakCapital) {
            workingDrawdown = workingCapital - peakCapital;
        }
        else {
            peakCapital = workingCapital;
            workingDrawdown = 0; // Reset at the peak.
        }
        if (trade.profit > 0) {
            totalProfits += trade.profit;
            ++numWinningTrades;
        }
        else {
            totalLosses += trade.profit;
            ++numLosingTrades;
        }
        maxDrawdown = Math.min(workingDrawdown, maxDrawdown);
        maxDrawdownPct = Math.min((maxDrawdown / peakCapital) * 100, maxDrawdownPct);
    }
    const rmultiples = trades
        .filter(trade => trade.rmultiple !== undefined)
        .map(trade => trade.rmultiple);
    const expectency = rmultiples.length > 0 ? new data_forge_1.Series(rmultiples).average() : undefined;
    const rmultipleStdDev = rmultiples.length > 0
        ? math.std(rmultiples)
        : undefined;
    let systemQuality;
    if (expectency !== undefined && rmultipleStdDev !== undefined) {
        if (rmultipleStdDev === 0) {
            systemQuality = undefined;
        }
        else {
            systemQuality = expectency / rmultipleStdDev;
        }
    }
    let profitFactor = undefined;
    const absTotalLosses = Math.abs(totalLosses);
    if (absTotalLosses > 0) {
        profitFactor = totalProfits / absTotalLosses;
    }
    const profit = workingCapital - startingCapital;
    const profitPct = (profit / startingCapital) * 100;
    const proportionWinning = totalTrades > 0 ? numWinningTrades / totalTrades : 0;
    const proportionLosing = totalTrades > 0 ? numLosingTrades / totalTrades : 0;
    const averageWinningTrade = numWinningTrades > 0 ? totalProfits / numWinningTrades : 0;
    const averageLosingTrade = numLosingTrades > 0 ? totalLosses / numLosingTrades : 0;
    const analysis = {
        startingCapital: startingCapital,
        finalCapital: workingCapital,
        profit: profit,
        profitPct: profitPct,
        growth: workingCapital / startingCapital,
        totalTrades: totalTrades,
        barCount: barCount,
        maxDrawdown: maxDrawdown,
        maxDrawdownPct: maxDrawdownPct,
        maxRiskPct: maxRiskPct,
        expectency: expectency,
        rmultipleStdDev: rmultipleStdDev,
        systemQuality: systemQuality,
        profitFactor: profitFactor,
        proportionProfitable: proportionWinning,
        percentProfitable: proportionWinning * 100,
        returnOnAccount: profitPct / Math.abs(maxDrawdownPct),
        averageProfitPerTrade: profit / totalTrades,
        numWinningTrades: numWinningTrades,
        numLosingTrades: numLosingTrades,
        averageWinningTrade: averageWinningTrade,
        averageLosingTrade: averageLosingTrade,
        expectedValue: (proportionWinning * averageWinningTrade) + (proportionLosing * averageLosingTrade),
    };
    return analysis;
}
exports.analyze = analyze;
//# sourceMappingURL=analyze.js.map