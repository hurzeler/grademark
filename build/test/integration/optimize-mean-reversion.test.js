"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const optimize_1 = require("../../lib/optimize");
const analyze_1 = require("../../lib/analyze");
const dataForge = require("data-forge");
require("data-forge-indicators");
const path = require("path");
const check_object_1 = require("../integration/check-object");
describe("optimize mean reversion", function () {
    this.timeout(50000);
    let inputSeries = dataForge.readFileSync(path.join(__dirname, "data/STW-short.csv"))
        .parseCSV()
        .parseDates("date", "D/MM/YYYY")
        .parseFloats(["open", "high", "low", "close", "volume"])
        .setIndex("date") // Index so we can later merge on date.
        .renameSeries({ date: "time" });
    function meanReversionStrategy(modifications) {
        let strategy = {
            parameters: {
                SMA: 30,
            },
            prepIndicators: args => {
                const movingAverage = args.inputSeries
                    .deflate(bar => bar.close)
                    .sma(args.parameters.SMA);
                return args.inputSeries
                    .withSeries("sma", movingAverage)
                    .skip(args.parameters.SMA)
                    .cast();
            },
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
    it("can optimize for largest objective function value", function () {
        const strategy = meanReversionStrategy();
        const result = optimize_1.optimize(strategy, [{
                name: "SMA",
                startingValue: 5,
                endingValue: 25,
                stepSize: 10,
            }], trades => analyze_1.analyze(10000, trades).profitPct, inputSeries, {
            searchDirection: "max",
            optimizationType: "grid",
            recordAllResults: true,
        });
        check_object_1.checkObjectExpectations(result, this.test);
    });
    it("larger optimization", function () {
        const strategy = meanReversionStrategy();
        const result = optimize_1.optimize(strategy, [{
                name: "SMA",
                startingValue: 5,
                endingValue: 25,
                stepSize: 2,
            }], trades => analyze_1.analyze(10000, trades).profitPct, inputSeries, {
            searchDirection: "max",
            optimizationType: "grid",
            recordAllResults: true,
        });
        check_object_1.checkObjectExpectations(result, this.test);
    });
});
//# sourceMappingURL=optimize-mean-reversion.test.js.map