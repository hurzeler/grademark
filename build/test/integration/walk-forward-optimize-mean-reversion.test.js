"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analyze_1 = require("../../lib/analyze");
const dataForge = require("data-forge");
require("data-forge-fs");
require("data-forge-indicators");
const path = require("path");
const check_object_1 = require("../integration/check-object");
const walk_forward_optimize_1 = require("../../lib/walk-forward-optimize");
describe("walk forward optimize mean reversion", function () {
    this.timeout(50000);
    let inputSeries = dataForge.readFileSync(path.join(__dirname, "data/STW.csv"))
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
    it("can do walk forward optimization", function () {
        const strategy = meanReversionStrategy();
        const result = walk_forward_optimize_1.walkForwardOptimize(strategy, [{
                name: "SMA",
                startingValue: 5,
                endingValue: 25,
                stepSize: 10,
            }], trades => analyze_1.analyze(10000, trades).profitPct, inputSeries, 90, 30, {
            searchDirection: "max",
            optimizationType: "grid",
            recordAllResults: true,
        });
        check_object_1.checkObjectExpectations(result, this.test);
    });
});
//# sourceMappingURL=walk-forward-optimize-mean-reversion.test.js.map