"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const compute_equity_curve_1 = require("../../lib/compute-equity-curve");
const moment = require("dayjs");
const strategy_1 = require("../../lib/strategy");
describe("compute equity curve", () => {
    function makeDate(dateStr, fmt) {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
    }
    it("no trades results in equity curve with only starting capital", () => {
        const startingCapital = 1000;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, []);
        chai_1.expect(equityCurve.length).to.eql(1);
        chai_1.expect(equityCurve[0]).to.eql(startingCapital);
    });
    it("can compute equity curve for single trade with profit", () => {
        const growth = 2;
        const singleTrade = {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: growth,
            holdingPeriod: 5,
            exitReason: "Sell",
        };
        const startingCapital = 100;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, [singleTrade]);
        chai_1.expect(equityCurve.length).to.eql(2);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth);
    });
    it("can compute equity curve for single trade with loss", () => {
        const growth = 0.5;
        const singleTrade = {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/29"),
            exitPrice: 5,
            profit: -5,
            profitPct: -50,
            growth: growth,
            holdingPeriod: 4,
            exitReason: "Sell",
        };
        const startingCapital = 100;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, [singleTrade]);
        chai_1.expect(equityCurve.length).to.eql(2);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth);
    });
    it("can compute equity curve for multiple trades with profit", () => {
        const growth1 = 2;
        const growth2 = 3;
        const trades = [
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: growth1,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/11/1"),
                entryPrice: 20,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 60,
                profit: 40,
                profitPct: 150,
                growth: growth2,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];
        const startingCapital = 10;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, trades);
        chai_1.expect(equityCurve.length).to.eql(3);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth1);
        chai_1.expect(equityCurve[2]).to.eql(startingCapital * growth1 * growth2);
    });
    it("can compute equity curve for multiple trades with loss", () => {
        const growth1 = 0.5;
        const growth2 = 0.8;
        const trades = [
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: growth1,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 8,
                profit: -2,
                profitPct: -20,
                growth: growth2,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];
        const startingCapital = 20;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, trades);
        chai_1.expect(equityCurve.length).to.eql(3);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth1);
        chai_1.expect(equityCurve[2]).to.eql(startingCapital * growth1 * growth2);
    });
    it("can compute equity curve for multiple trades with profit and loss", () => {
        const growth1 = 2;
        const growth2 = 0.5;
        const trades = [
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/10/25"),
                entryPrice: 10,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: growth1,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/11/1"),
                entryPrice: 20,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: growth2,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];
        const startingCapital = 20;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, trades);
        chai_1.expect(equityCurve.length).to.eql(3);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth1);
        chai_1.expect(equityCurve[2]).to.eql(startingCapital * growth1 * growth2);
    });
    it("can compute equity curve for multiple trades with loss and profit", () => {
        const growth1 = 0.5;
        const growth2 = 2;
        const trades = [
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/10/25"),
                entryPrice: 20,
                exitTime: makeDate("2018/10/30"),
                exitPrice: 10,
                profit: -10,
                profitPct: -50,
                growth: growth1,
                holdingPeriod: 5,
                exitReason: "Sell",
            },
            {
                direction: strategy_1.TradeDirection.Long,
                entryTime: makeDate("2018/11/1"),
                entryPrice: 10,
                exitTime: makeDate("2018/11/10"),
                exitPrice: 20,
                profit: 10,
                profitPct: 100,
                growth: growth2,
                holdingPeriod: 10,
                exitReason: "Sell",
            },
        ];
        const startingCapital = 20;
        const equityCurve = compute_equity_curve_1.computeEquityCurve(startingCapital, trades);
        chai_1.expect(equityCurve.length).to.eql(3);
        chai_1.expect(equityCurve[1]).to.eql(startingCapital * growth1);
        chai_1.expect(equityCurve[2]).to.eql(startingCapital * growth1 * growth2);
    });
});
//# sourceMappingURL=compute-equity-curve.test.js.map