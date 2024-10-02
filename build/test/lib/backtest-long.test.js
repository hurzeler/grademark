"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const backtest_1 = require("../../lib/backtest");
const data_forge_1 = require("data-forge");
const strategy_1 = require("../../lib/strategy");
const moment = require("dayjs");
describe("backtest long", () => {
    function round(value) {
        return Math.round(value * 100) / 100;
    }
    function makeDate(dateStr, fmt) {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
    }
    function mockBar() {
        return {
            time: "2018/10/20",
            close: 2,
        };
    }
    function makeBar(bar) {
        return {
            time: makeDate(bar.time),
            open: bar.open !== undefined ? bar.open : bar.close,
            high: bar.high !== undefined ? bar.high : bar.close,
            low: bar.low !== undefined ? bar.low : bar.close,
            close: bar.close,
            volume: bar.volume !== undefined ? bar.volume : 1,
        };
    }
    function makeDataSeries(bars) {
        return new data_forge_1.DataFrame(bars.map(makeBar));
    }
    const mockEntry = () => { };
    const mockExit = () => { };
    function mockStrategy() {
        return {
            entryRule: mockEntry,
            exitRule: mockExit,
        };
    }
    function unconditionalLongEntry(enterPosition, args) {
        enterPosition({ direction: strategy_1.TradeDirection.Long }); // Unconditionally enter position at market price.
    }
    ;
    function unconditionalLongExit(exitPosition, args) {
        exitPosition(); // Unconditionally exit position at market price.
    }
    ;
    const longStrategyWithUnconditionalEntry = {
        entryRule: unconditionalLongEntry,
        exitRule: mockExit,
    };
    const longStrategyWithUnconditionalEntryAndExit = {
        entryRule: unconditionalLongEntry,
        exitRule: unconditionalLongExit,
    };
    const simpleInputSeries = makeDataSeries([
        { time: "2018/10/20", close: 1 },
        { time: "2018/10/21", close: 2 },
        { time: "2018/10/22", close: 3 },
    ]);
    const longerDataSeries = makeDataSeries([
        { time: "2018/10/20", close: 1 },
        { time: "2018/10/21", close: 2 },
        { time: "2018/10/22", close: 4 },
        { time: "2018/10/23", close: 5 },
        { time: "2018/10/24", close: 6 },
    ]);
    it('going long makes a profit when the price rises', () => {
        const entryPrice = 3;
        const exitPrice = 7;
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", open: 1, close: 2 },
            { time: "2018/10/21", open: entryPrice, close: 4 },
            { time: "2018/10/22", open: 5, close: 6 },
            { time: "2018/10/23", open: exitPrice, close: 8 },
        ]);
        const trades = backtest_1.backtest(longStrategyWithUnconditionalEntryAndExit, inputSeries);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.profit).to.be.greaterThan(0);
        chai_1.expect(singleTrade.profit).to.eql(exitPrice - entryPrice);
    });
    it('going long makes a loss when the price drops', () => {
        const entryPrice = 6;
        const exitPrice = 2;
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", open: 8, close: 7 },
            { time: "2018/10/21", open: entryPrice, close: 5 },
            { time: "2018/10/22", open: 4, close: 3 },
            { time: "2018/10/23", open: exitPrice, close: 1 },
        ]);
        const trades = backtest_1.backtest(longStrategyWithUnconditionalEntryAndExit, inputSeries);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.profit).to.be.lessThan(0);
        chai_1.expect(singleTrade.profit).to.eql(exitPrice - entryPrice);
    });
    it("can exit long via stop loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", close: 70 },
            { time: "2018/10/24", close: 70 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.stopPrice).to.eql(80);
        chai_1.expect(singleTrade.exitReason).to.eql("stop-loss");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/23"));
    });
    it("stop loss exits long based on intrabar low", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", open: 90, high: 100, low: 30, close: 70 },
            { time: "2018/10/24", close: 70 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitPrice).to.eql(80);
    });
    it("stop loss is not triggered unless there is a significant loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", close: 85 },
            { time: "2018/10/24", close: 82 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitReason).to.eql("finalize");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/24"));
    });
    it("can exit long via profit target", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            profitTarget: args => args.entryPrice * (10 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 100 },
            { time: "2018/10/23", close: 110 },
            { time: "2018/10/24", close: 110 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.profitTarget).to.eql(110);
        chai_1.expect(singleTrade.exitReason).to.eql("profit-target");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/23"));
    });
    it("profit target exits long based on intrabar high", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            profitTarget: args => args.entryPrice * (10 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", open: 90, high: 120, low: 90, close: 90 },
            { time: "2018/10/24", close: 70 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitPrice).to.eql(110);
    });
    it("long exit is not triggered unless target profit is achieved", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            profitTarget: args => args.entryPrice * (30 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 100 },
            { time: "2018/10/23", close: 110 },
            { time: "2018/10/24", close: 120 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitReason).to.eql("finalize");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/24"));
    });
    it("can exit long via trailing stop loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            trailingStopLoss: args => args.bar.close * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", close: 70 },
            { time: "2018/10/24", close: 70 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitReason).to.eql("stop-loss");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/23"));
    });
    it("can exit long via rising trailing stop loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            trailingStopLoss: args => args.bar.close * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 200 },
            { time: "2018/10/23", close: 150 },
            { time: "2018/10/24", close: 150 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitReason).to.eql("stop-loss");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/23"));
    });
    it("trailing stop loss exits long based on intrabar low", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            trailingStopLoss: args => args.bar.close * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", open: 90, high: 100, low: 30, close: 70 },
            { time: "2018/10/24", close: 70 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitPrice).to.eql(80);
    });
    it("trailing stop loss is not triggered unless there is a significant loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            trailingStopLoss: args => args.bar.close * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 90 },
            { time: "2018/10/23", close: 85 },
            { time: "2018/10/24", close: 82 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.exitReason).to.eql("finalize");
        chai_1.expect(singleTrade.exitTime).to.eql(makeDate("2018/10/24"));
    });
    it("can place intrabar conditional long order", () => {
        const strategy = {
            entryRule: (enterPosition, args) => {
                enterPosition({
                    direction: strategy_1.TradeDirection.Long,
                    entryPrice: 6,
                });
            },
            exitRule: mockExit,
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 1 },
            { time: "2018/10/21", close: 2 },
            { time: "2018/10/22", close: 4 },
            { time: "2018/10/23", close: 5, high: 6 },
            { time: "2018/10/24", close: 5 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.entryTime).to.eql(makeDate("2018/10/23"));
    });
    it("conditional long order is not executed if price doesn't reach target", () => {
        const strategy = {
            entryRule: (enterPosition, args) => {
                enterPosition({
                    direction: strategy_1.TradeDirection.Long,
                    entryPrice: 6,
                });
            },
            exitRule: mockExit,
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 1 },
            { time: "2018/10/21", close: 2 },
            { time: "2018/10/22", close: 3 },
            { time: "2018/10/23", close: 4 },
            { time: "2018/10/24", close: 5 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(0);
    });
    it("computes risk from initial stop", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 100 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.riskPct).to.eql(20);
    });
    it("computes rmultiple from initial risk and profit", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 120 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.rmultiple).to.eql(1);
    });
    it("computes rmultiple from initial risk and loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 80 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries);
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.rmultiple).to.eql(-1);
    });
    it("current risk rises as profit increases", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            stopLoss: args => args.entryPrice * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 150 },
            { time: "2018/10/23", close: 140 },
            { time: "2018/10/24", close: 200 },
            { time: "2018/10/25", close: 190 },
            { time: "2018/10/26", close: 250 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries, { recordRisk: true });
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        const output = singleTrade.riskSeries.map(risk => ({ time: risk.time, value: round(risk.value) }));
        chai_1.expect(output).to.eql([
            {
                time: makeDate("2018/10/21"),
                value: 20,
            },
            {
                time: makeDate("2018/10/22"),
                value: 46.67,
            },
            {
                time: makeDate("2018/10/23"),
                value: 42.86,
            },
            {
                time: makeDate("2018/10/24"),
                value: 60,
            },
            {
                time: makeDate("2018/10/25"),
                value: 57.89,
            },
            {
                time: makeDate("2018/10/26"),
                value: 68,
            },
        ]);
    });
    it("current risk remains low by trailing stop loss", () => {
        const strategy = {
            entryRule: unconditionalLongEntry,
            trailingStopLoss: args => args.bar.close * (20 / 100)
        };
        const inputSeries = makeDataSeries([
            { time: "2018/10/20", close: 100 },
            { time: "2018/10/21", close: 100 },
            { time: "2018/10/22", close: 150 },
            { time: "2018/10/23", close: 140 },
            { time: "2018/10/24", close: 200 },
            { time: "2018/10/25", close: 190 },
            { time: "2018/10/26", close: 250 },
        ]);
        const trades = backtest_1.backtest(strategy, inputSeries, { recordRisk: true });
        chai_1.expect(trades.length).to.eql(1);
        const singleTrade = trades[0];
        const output = singleTrade.riskSeries.map(risk => ({ time: risk.time, value: round(risk.value) }));
        chai_1.expect(output).to.eql([
            {
                time: makeDate("2018/10/21"),
                value: 20,
            },
            {
                time: makeDate("2018/10/22"),
                value: 20,
            },
            {
                time: makeDate("2018/10/23"),
                value: 14.29,
            },
            {
                time: makeDate("2018/10/24"),
                value: 20,
            },
            {
                time: makeDate("2018/10/25"),
                value: 15.79,
            },
            {
                time: makeDate("2018/10/26"),
                value: 20,
            },
        ]);
    });
    it('profit is computed for long trade finalized at end of the trading period', () => {
        const inputData = makeDataSeries([
            { time: "2018/10/20", close: 5 },
            { time: "2018/10/21", close: 5 },
            { time: "2018/10/22", close: 10 },
        ]);
        const trades = backtest_1.backtest(longStrategyWithUnconditionalEntry, inputData);
        const singleTrade = trades[0];
        chai_1.expect(singleTrade.profit).to.eql(5);
        chai_1.expect(singleTrade.profitPct).to.eql(100);
        chai_1.expect(singleTrade.growth).to.eql(2);
    });
});
//# sourceMappingURL=backtest-long.test.js.map