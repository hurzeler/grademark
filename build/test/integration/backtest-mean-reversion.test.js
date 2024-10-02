"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataForge = require("data-forge");
require("data-forge-indicators");
const path = require("path");
const __1 = require("../..");
const check_object_1 = require("./check-object");
describe("backtest mean reversion", function () {
    this.timeout(25000);
    let inputSeries = dataForge.readFileSync(path.join(__dirname, "data/STW.csv"))
        .parseCSV()
        .parseDates("date", "D/MM/YYYY")
        .parseFloats(["open", "high", "low", "close", "volume"])
        .setIndex("date") // Index so we can later merge on date.
        .renameSeries({ date: "time" });
    const movingAverage = inputSeries
        .deflate(bar => bar.close) // Extract closing price series.
        .sma(30); // 30 day moving average.
    inputSeries = inputSeries
        .withSeries("sma", movingAverage) // Integrate moving average into data, indexed on date.
        .skip(30); // Skip blank sma entries.
    function meanReversionStrategy(modifications) {
        let strategy = {
            entryRule: (enterPosition, args) => {
                if (args.bar.close < args.bar.sma) {
                    enterPosition();
                }
            },
            exitRule: (exitPosition, args) => {
                if (args.bar.close > args.bar.sma) {
                    exitPosition();
                }
            },
        };
        if (modifications) {
            strategy = Object.assign(strategy, modifications);
        }
        return strategy;
    }
    it("basic strategy", function () {
        const strategy = meanReversionStrategy();
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("with stop loss", function () {
        const strategy = meanReversionStrategy({
            stopLoss: args => args.entryPrice * (1.5 / 100),
        });
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("with trailing stop", function () {
        const strategy = meanReversionStrategy({
            trailingStopLoss: args => args.bar.close * (3 / 100),
        });
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("with profit target", function () {
        const strategy = meanReversionStrategy({
            profitTarget: args => args.entryPrice * (1 / 100),
        });
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("with conditional buy", function () {
        const strategy = meanReversionStrategy({
            entryRule: (enterPosition, args) => {
                enterPosition({ entryPrice: args.bar.close + (args.bar.close * (0.1 / 100)) });
            }
        });
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("with maximum holding period", function () {
        const strategy = meanReversionStrategy({
            exitRule: (exitPosition, args) => {
                if (args.position.holdingPeriod >= 3) {
                    exitPosition();
                }
            }
        });
        const trades = __1.backtest(strategy, inputSeries);
        check_object_1.checkArrayExpectations(trades, this.test);
    });
    it("can record trailing stop", function () {
        const strategy = meanReversionStrategy({
            trailingStopLoss: args => args.bar.close * (3 / 100),
        });
        const trades = __1.backtest(strategy, inputSeries, { recordStopPrice: true });
        const stopPrice = trades.map(trade => trade.stopPriceSeries).flat();
        check_object_1.checkArrayExpectations(stopPrice, this.test);
    });
    it("can record risk", function () {
        const strategy = meanReversionStrategy({
            stopLoss: args => args.entryPrice * (5 / 100),
        });
        const trades = __1.backtest(strategy, inputSeries, { recordRisk: true });
        const risk = trades.map(trade => trade.riskSeries).flat();
        check_object_1.checkArrayExpectations(risk, this.test);
    });
});
//# sourceMappingURL=backtest-mean-reversion.test.js.map