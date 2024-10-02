"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const optimize_1 = require("../../lib/optimize");
const data_forge_1 = require("data-forge");
const moment = require("dayjs");
describe("optimize", () => {
    function makeDate(dateStr, fmt) {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
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
    function unconditionalEntry(enterPosition, args) {
        enterPosition(); // Unconditionally enter position at market price.
    }
    ;
    const inputSeries = makeDataSeries([
        { time: "2018/10/20", close: 100 },
        { time: "2018/10/21", close: 110 },
        { time: "2018/10/22", close: 120 },
        { time: "2018/10/23", close: 130 },
        { time: "2018/10/24", close: 140 },
        { time: "2018/10/25", close: 150 },
        { time: "2018/10/26", close: 160 },
        { time: "2018/10/27", close: 170 },
        { time: "2018/10/28", close: 180 },
        { time: "2018/10/29", close: 190 },
    ]);
    it("parameter value with highest performance metric wins", () => {
        const strategy = {
            entryRule: unconditionalEntry,
        };
        const parameter = {
            name: "MyParameter",
            startingValue: 1,
            endingValue: 3,
            stepSize: 1,
        };
        const mockPerformanceMetrics = [5, 6, 2];
        let mockPerformanceMetricIndex = 0;
        const objectiveFn = (trades) => mockPerformanceMetrics[mockPerformanceMetricIndex++];
        const result = optimize_1.optimize(strategy, [parameter], objectiveFn, inputSeries, { searchDirection: "max", optimizationType: "grid" });
        chai_1.expect(result.bestParameterValues.MyParameter).to.eql(2);
        chai_1.expect(result.bestResult).to.eql(6);
    });
    it("iteration with lowest performance metric wins", () => {
        const strategy = {
            entryRule: unconditionalEntry,
        };
        const parameter = {
            name: "MyParameter",
            startingValue: 1,
            endingValue: 3,
            stepSize: 1,
        };
        const mockPerformanceMetrics = [5, 6, 2];
        let mockPerformanceMetricIndex = 0;
        const objectiveFn = (trades) => mockPerformanceMetrics[mockPerformanceMetricIndex++];
        const result = optimize_1.optimize(strategy, [parameter], objectiveFn, inputSeries, { searchDirection: "min", optimizationType: "grid" });
        chai_1.expect(result.bestParameterValues.MyParameter).to.eql(3);
        chai_1.expect(result.bestResult).to.eql(2);
    });
});
//# sourceMappingURL=optimize.test.js.map