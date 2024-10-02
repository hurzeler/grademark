"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const check_object_1 = require("./check-object");
const __1 = require("../..");
describe("monte-carlo mean reversion", function () {
    this.timeout(15000);
    const sampleTrades = check_object_1.readDataFrame(path.join(__dirname, "data/sample trades - all profits.dataframe")).toArray();
    it("monte-carlo", function () {
        const samples = __1.monteCarlo(sampleTrades, 10, 5);
        const flattened = samples.flat();
        check_object_1.checkObjectExpectations(flattened, this.test);
    });
});
//# sourceMappingURL=monte-carlo-mean-reversion.test.js.map