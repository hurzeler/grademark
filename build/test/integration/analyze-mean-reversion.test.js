"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
require("data-forge-indicators");
const check_object_1 = require("./check-object");
const __1 = require("../..");
describe("analyze mean reversion", function () {
    this.timeout(15000);
    it("with only profits", function () {
        const sampleTrades = check_object_1.readDataFrame(path.join(__dirname, "data/sample trades - all profits.dataframe")).toArray();
        const analysis = __1.analyze(10000, sampleTrades);
        check_object_1.checkObjectExpectations(analysis, this.test);
    });
    it("with only losses", function () {
        const sampleTrades = check_object_1.readDataFrame(path.join(__dirname, "data/sample trades - all losses.dataframe")).toArray();
        const analysis = __1.analyze(10000, sampleTrades);
        check_object_1.checkObjectExpectations(analysis, this.test);
    });
    it("with profits and losses", function () {
        const sampleTrades = check_object_1.readDataFrame(path.join(__dirname, "data/sample trades - profits and losses.dataframe")).toArray();
        const analysis = __1.analyze(10000, sampleTrades);
        check_object_1.checkObjectExpectations(analysis, this.test);
    });
});
//# sourceMappingURL=analyze-mean-reversion.test.js.map