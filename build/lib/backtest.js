"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_forge_1 = require("data-forge");
const chai_1 = require("chai");
const strategy_1 = require("./strategy");
const utils_1 = require("./utils");
const CBuffer = require('CBuffer');
/**
 * Update an open position for a new bar.
 *
 * @param position The position to update.
 * @param bar The current bar.
 */
function updatePosition(position, bar) {
    position.profit = bar.close - position.entryPrice;
    position.profitPct = (position.profit / position.entryPrice) * 100;
    position.growth = position.direction === strategy_1.TradeDirection.Long
        ? bar.close / position.entryPrice
        : position.entryPrice / bar.close;
    if (position.curStopPrice !== undefined) {
        const unitRisk = position.direction === strategy_1.TradeDirection.Long
            ? bar.close - position.curStopPrice
            : position.curStopPrice - bar.close;
        position.curRiskPct = (unitRisk / bar.close) * 100;
        position.curRMultiple = position.profit / unitRisk;
    }
    position.holdingPeriod += 1;
}
/**
 * Close a position that has been exited and produce a trade.
 *
 * @param position The position to close.
 * @param exitTime The timestamp for the bar when the position was exited.
 * @param exitPrice The price of the instrument when the position was exited.
 */
function finalizePosition(position, exitTime, exitPrice, exitReason) {
    const profit = position.direction === strategy_1.TradeDirection.Long
        ? exitPrice - position.entryPrice
        : position.entryPrice - exitPrice;
    let rmultiple;
    if (position.initialUnitRisk !== undefined) {
        rmultiple = profit / position.initialUnitRisk;
    }
    return {
        direction: position.direction,
        entryTime: position.entryTime,
        entryPrice: position.entryPrice,
        exitTime: exitTime,
        exitPrice: exitPrice,
        profit: profit,
        profitPct: (profit / position.entryPrice) * 100,
        growth: position.direction === strategy_1.TradeDirection.Long
            ? exitPrice / position.entryPrice
            : position.entryPrice / exitPrice,
        riskPct: position.initialRiskPct,
        riskSeries: position.riskSeries,
        rmultiple: rmultiple,
        holdingPeriod: position.holdingPeriod,
        exitReason: exitReason,
        stopPrice: position.initialStopPrice,
        stopPriceSeries: position.stopPriceSeries,
        profitTarget: position.profitTarget,
    };
}
var PositionStatus;
(function (PositionStatus) {
    PositionStatus[PositionStatus["None"] = 0] = "None";
    PositionStatus[PositionStatus["Enter"] = 1] = "Enter";
    PositionStatus[PositionStatus["Position"] = 2] = "Position";
    PositionStatus[PositionStatus["Exit"] = 3] = "Exit";
})(PositionStatus || (PositionStatus = {}));
/**
 * Backtest a trading strategy against a data series and generate a sequence of trades.
 */
function backtest(strategy, inputSeries, options) {
    if (!utils_1.isObject(strategy)) {
        throw new Error("Expected 'strategy' argument to 'backtest' to be an object that defines the trading strategy to backtest.");
    }
    if (!utils_1.isObject(inputSeries) && inputSeries.count() > 0) {
        throw new Error("Expected 'inputSeries' argument to 'backtest' to be a Data-Forge DataFrame that contains historical input data for backtesting.");
    }
    if (!options) {
        options = {};
    }
    if (inputSeries.none()) {
        throw new Error("Expect input data series to contain at last 1 bar.");
    }
    const lookbackPeriod = strategy.lookbackPeriod || 1;
    if (inputSeries.count() < lookbackPeriod) {
        throw new Error("You have less input data than your lookback period, the size of your input data should be some multiple of your lookback period.");
    }
    const strategyParameters = strategy.parameters || {};
    let indicatorsSeries;
    //
    // Prepare indicators.
    //
    if (strategy.prepIndicators) {
        indicatorsSeries = strategy.prepIndicators({
            parameters: strategyParameters,
            inputSeries: inputSeries
        });
    }
    else {
        indicatorsSeries = inputSeries;
    }
    //
    // Tracks trades that have been closed.
    //
    const completedTrades = [];
    //
    // Status of the position at any give time.
    //
    let positionStatus = PositionStatus.None;
    //
    // Records the direction of a position/trade.
    //
    let positionDirection = strategy_1.TradeDirection.Long;
    //
    // Records the price for conditional intrabar entry.
    //
    let conditionalEntryPrice;
    //
    // Tracks the currently open position, or set to null when there is no open position.
    //
    let openPosition = null;
    //
    // Create a circular buffer to use for the lookback.
    //
    const lookbackBuffer = new CBuffer(lookbackPeriod);
    /**
     * User calls this function to enter a position on the instrument.
     */
    function enterPosition(options) {
        chai_1.assert(positionStatus === PositionStatus.None, "Can only enter a position when not already in one.");
        positionStatus = PositionStatus.Enter; // Enter position next bar.
        positionDirection = options && options.direction || strategy_1.TradeDirection.Long;
        conditionalEntryPrice = options && options.entryPrice;
    }
    /**
     * User calls this function to exit a position on the instrument.
     */
    function exitPosition() {
        chai_1.assert(positionStatus === PositionStatus.Position, "Can only exit a position when we are in a position.");
        positionStatus = PositionStatus.Exit; // Exit position next bar.
    }
    //
    // Close the current open position.
    //
    function closePosition(bar, exitPrice, exitReason) {
        const trade = finalizePosition(openPosition, bar.time, exitPrice, exitReason);
        completedTrades.push(trade);
        // Reset to no open position;
        openPosition = null;
        positionStatus = PositionStatus.None;
    }
    for (const bar of indicatorsSeries) {
        lookbackBuffer.push(bar);
        if (lookbackBuffer.length < lookbackPeriod) {
            continue; // Don't invoke rules until lookback period is satisfied.
        }
        switch (+positionStatus) { //TODO: + is a work around for TS switch stmt with enum.
            case PositionStatus.None:
                strategy.entryRule(enterPosition, {
                    bar: bar,
                    lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                    parameters: strategyParameters
                });
                break;
            case PositionStatus.Enter:
                chai_1.assert(openPosition === null, "Expected there to be no open position initialised yet!");
                if (conditionalEntryPrice !== undefined) {
                    // Must breach conditional entry price before entering position.
                    if (positionDirection === strategy_1.TradeDirection.Long) {
                        if (bar.high < conditionalEntryPrice) {
                            break;
                        }
                    }
                    else {
                        if (bar.low > conditionalEntryPrice) {
                            break;
                        }
                    }
                }
                const entryPrice = bar.open;
                openPosition = {
                    direction: positionDirection,
                    entryTime: bar.time,
                    entryPrice: entryPrice,
                    growth: 1,
                    profit: 0,
                    profitPct: 0,
                    holdingPeriod: 0,
                };
                if (strategy.stopLoss) {
                    const initialStopDistance = strategy.stopLoss({
                        entryPrice: entryPrice,
                        position: openPosition,
                        bar: bar,
                        lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                        parameters: strategyParameters
                    });
                    openPosition.initialStopPrice = openPosition.direction === strategy_1.TradeDirection.Long
                        ? entryPrice - initialStopDistance
                        : entryPrice + initialStopDistance;
                    openPosition.curStopPrice = openPosition.initialStopPrice;
                }
                if (strategy.trailingStopLoss) {
                    const trailingStopDistance = strategy.trailingStopLoss({
                        entryPrice: entryPrice,
                        position: openPosition,
                        bar: bar,
                        lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                        parameters: strategyParameters
                    });
                    const trailingStopPrice = openPosition.direction === strategy_1.TradeDirection.Long
                        ? entryPrice - trailingStopDistance
                        : entryPrice + trailingStopDistance;
                    if (openPosition.initialStopPrice === undefined) {
                        openPosition.initialStopPrice = trailingStopPrice;
                    }
                    else {
                        openPosition.initialStopPrice = openPosition.direction === strategy_1.TradeDirection.Long
                            ? Math.max(openPosition.initialStopPrice, trailingStopPrice)
                            : Math.min(openPosition.initialStopPrice, trailingStopPrice);
                    }
                    openPosition.curStopPrice = openPosition.initialStopPrice;
                    if (options.recordStopPrice) {
                        openPosition.stopPriceSeries = [
                            {
                                time: bar.time,
                                value: openPosition.curStopPrice
                            },
                        ];
                    }
                }
                if (openPosition.curStopPrice !== undefined) {
                    openPosition.initialUnitRisk = openPosition.direction === strategy_1.TradeDirection.Long
                        ? entryPrice - openPosition.curStopPrice
                        : openPosition.curStopPrice - entryPrice;
                    openPosition.initialRiskPct = (openPosition.initialUnitRisk / entryPrice) * 100;
                    openPosition.curRiskPct = openPosition.initialRiskPct;
                    openPosition.curRMultiple = 0;
                    if (options.recordRisk) {
                        openPosition.riskSeries = [
                            {
                                time: bar.time,
                                value: openPosition.curRiskPct
                            },
                        ];
                    }
                }
                if (strategy.profitTarget) {
                    const profitDistance = strategy.profitTarget({
                        entryPrice: entryPrice,
                        position: openPosition,
                        bar: bar,
                        lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                        parameters: strategyParameters
                    });
                    openPosition.profitTarget = openPosition.direction === strategy_1.TradeDirection.Long
                        ? entryPrice + profitDistance
                        : entryPrice - profitDistance;
                }
                positionStatus = PositionStatus.Position;
                break;
            case PositionStatus.Position:
                chai_1.assert(openPosition !== null, "Expected open position to already be initialised!");
                if (openPosition.curStopPrice !== undefined) {
                    if (openPosition.direction === strategy_1.TradeDirection.Long) {
                        if (bar.low <= openPosition.curStopPrice) {
                            // Exit intrabar due to stop loss.
                            closePosition(bar, openPosition.curStopPrice, "stop-loss");
                            break;
                        }
                    }
                    else {
                        if (bar.high >= openPosition.curStopPrice) {
                            // Exit intrabar due to stop loss.
                            closePosition(bar, openPosition.curStopPrice, "stop-loss");
                            break;
                        }
                    }
                }
                if (strategy.trailingStopLoss !== undefined) {
                    //
                    // Revaluate trailing stop loss.
                    //
                    const trailingStopDistance = strategy.trailingStopLoss({
                        entryPrice: openPosition.entryPrice,
                        position: openPosition,
                        bar: bar,
                        lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                        parameters: strategyParameters
                    });
                    if (openPosition.direction === strategy_1.TradeDirection.Long) {
                        const newTrailingStopPrice = bar.close - trailingStopDistance;
                        if (newTrailingStopPrice > openPosition.curStopPrice) {
                            openPosition.curStopPrice = newTrailingStopPrice;
                        }
                    }
                    else {
                        const newTrailingStopPrice = bar.close + trailingStopDistance;
                        if (newTrailingStopPrice < openPosition.curStopPrice) {
                            openPosition.curStopPrice = newTrailingStopPrice;
                        }
                    }
                    if (options.recordStopPrice) {
                        openPosition.stopPriceSeries.push({
                            time: bar.time,
                            value: openPosition.curStopPrice
                        });
                    }
                }
                if (openPosition.profitTarget !== undefined) {
                    if (openPosition.direction === strategy_1.TradeDirection.Long) {
                        if (bar.high >= openPosition.profitTarget) {
                            // Exit intrabar due to profit target.
                            closePosition(bar, openPosition.profitTarget, "profit-target");
                            break;
                        }
                    }
                    else {
                        if (bar.low <= openPosition.profitTarget) {
                            // Exit intrabar due to profit target.
                            closePosition(bar, openPosition.profitTarget, "profit-target");
                            break;
                        }
                    }
                }
                updatePosition(openPosition, bar);
                if (openPosition.curRiskPct !== undefined && options.recordRisk) {
                    openPosition.riskSeries.push({
                        time: bar.time,
                        value: openPosition.curRiskPct
                    });
                }
                if (strategy.exitRule) {
                    strategy.exitRule(exitPosition, {
                        entryPrice: openPosition.entryPrice,
                        position: openPosition,
                        bar: bar,
                        lookback: new data_forge_1.DataFrame(lookbackBuffer.data),
                        parameters: strategyParameters
                    });
                }
                break;
            case PositionStatus.Exit:
                chai_1.assert(openPosition !== null, "Expected open position to already be initialised!");
                closePosition(bar, bar.open, "exit-rule");
                break;
            default:
                throw new Error("Unexpected state!");
        }
    }
    if (openPosition) {
        // Finalize open position.
        const lastBar = indicatorsSeries.last();
        const lastTrade = finalizePosition(openPosition, lastBar.time, lastBar.close, "finalize");
        completedTrades.push(lastTrade);
    }
    return completedTrades;
}
exports.backtest = backtest;
//# sourceMappingURL=backtest.js.map