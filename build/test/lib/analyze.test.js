"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const analyze_1 = require("../../lib/analyze");
const moment = require("dayjs");
const strategy_1 = require("../../lib/strategy");
describe("analyze", () => {
    function round(value) {
        return Math.round(value * 100) / 100;
    }
    function makeDate(dateStr, fmt) {
        return moment(dateStr, fmt || "YYYY/MM/DD").toDate();
    }
    it("analysis records starting capital", () => {
        const analysis1 = analyze_1.analyze(1000, []);
        chai_1.expect(analysis1.startingCapital).to.eql(1000);
        const analysis2 = analyze_1.analyze(1200, []);
        chai_1.expect(analysis2.startingCapital).to.eql(1200);
    });
    it("analysis of zero trades has zero profit", () => {
        const analysis = analyze_1.analyze(1000, []);
        chai_1.expect(analysis.profit).to.eql(0);
        chai_1.expect(analysis.profitPct).to.eql(0);
        chai_1.expect(analysis.growth).to.eql(1);
    });
    it("analysis of zero trades has no drawdown", () => {
        const analysis = analyze_1.analyze(1000, []);
        chai_1.expect(analysis.maxDrawdown).to.eql(0);
        chai_1.expect(analysis.maxDrawdownPct).to.eql(0);
    });
    it("analysis of zero trades has zero bar count", () => {
        const analysis = analyze_1.analyze(1000, []);
        chai_1.expect(analysis.barCount).to.eql(0);
    });
    it("analysis of zero trades has undefined risk", () => {
        const analysis = analyze_1.analyze(1000, []);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    it("analysis of zero trades records final capital to be the same as starting capital", () => {
        const analysis = analyze_1.analyze(2000, []);
        chai_1.expect(analysis.finalCapital).to.eql(2000);
    });
    const aProfit = {
        direction: strategy_1.TradeDirection.Long,
        entryTime: makeDate("2018/10/25"),
        entryPrice: 10,
        exitTime: makeDate("2018/10/30"),
        exitPrice: 20,
        profit: 10,
        profitPct: 100,
        growth: 2,
        riskPct: undefined,
        rmultiple: undefined,
        holdingPeriod: 5,
        exitReason: "Sell",
    };
    it("can analyze single trade with profit", () => {
        const analysis = analyze_1.analyze(10, [aProfit]);
        chai_1.expect(analysis.startingCapital).to.eql(10);
        chai_1.expect(analysis.finalCapital).to.eql(20);
        chai_1.expect(analysis.profit).to.eql(10);
        chai_1.expect(analysis.profitPct).to.eql(100);
        chai_1.expect(analysis.growth).to.eql(2);
        chai_1.expect(analysis.barCount).to.eql(5);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    const aLoss = {
        direction: strategy_1.TradeDirection.Long,
        entryTime: makeDate("2018/10/25"),
        entryPrice: 10,
        exitTime: makeDate("2018/10/29"),
        exitPrice: 5,
        profit: -5,
        profitPct: -50,
        growth: 0.5,
        riskPct: undefined,
        rmultiple: undefined,
        holdingPeriod: 4,
        exitReason: "Sell",
    };
    it("can analyze single trade with loss", () => {
        const analysis = analyze_1.analyze(10, [aLoss]);
        chai_1.expect(analysis.startingCapital).to.eql(10);
        chai_1.expect(analysis.finalCapital).to.eql(5);
        chai_1.expect(analysis.profit).to.eql(-5);
        chai_1.expect(analysis.profitPct).to.eql(-50);
        chai_1.expect(analysis.growth).to.eql(0.5);
        chai_1.expect(analysis.barCount).to.eql(4);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    const twoProfits = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: 2,
            riskPct: undefined,
            rmultiple: undefined,
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
            growth: 3,
            riskPct: undefined,
            rmultiple: undefined,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
    ];
    it("can analyze multiple trades with profit", () => {
        const analysis = analyze_1.analyze(10, twoProfits);
        chai_1.expect(analysis.startingCapital).to.eql(10);
        chai_1.expect(analysis.finalCapital).to.eql(60);
        chai_1.expect(analysis.profit).to.eql(50);
        chai_1.expect(analysis.profitPct).to.eql(500);
        chai_1.expect(analysis.growth).to.eql(6);
        chai_1.expect(analysis.barCount).to.eql(15);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    const twoLosses = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 20,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 10,
            profit: -10,
            profitPct: -50,
            growth: 0.5,
            riskPct: undefined,
            rmultiple: undefined,
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
            growth: 0.8,
            riskPct: undefined,
            rmultiple: undefined,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
    ];
    it("can analyze multiple trades with loss", () => {
        const analysis = analyze_1.analyze(20, twoLosses);
        chai_1.expect(analysis.startingCapital).to.eql(20);
        chai_1.expect(analysis.finalCapital).to.eql(8);
        chai_1.expect(analysis.profit).to.eql(-12);
        chai_1.expect(analysis.profitPct).to.eql(-60);
        chai_1.expect(analysis.growth).to.eql(0.4);
        chai_1.expect(analysis.barCount).to.eql(15);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    const aProfitThenALoss = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 10,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 20,
            profit: 10,
            profitPct: 100,
            growth: 2,
            riskPct: undefined,
            rmultiple: undefined,
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
            growth: 0.5,
            riskPct: undefined,
            rmultiple: undefined,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
    ];
    it("can analyze multiple trades with profit and loss", () => {
        const analysis = analyze_1.analyze(10, aProfitThenALoss);
        chai_1.expect(analysis.startingCapital).to.eql(10);
        chai_1.expect(analysis.finalCapital).to.eql(10);
        chai_1.expect(analysis.profit).to.eql(0);
        chai_1.expect(analysis.profitPct).to.eql(0);
        chai_1.expect(analysis.growth).to.eql(1);
        chai_1.expect(analysis.barCount).to.eql(15);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    const aLossThenAProfit = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 20,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 10,
            profit: -10,
            profitPct: -50,
            growth: 0.5,
            riskPct: undefined,
            rmultiple: undefined,
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
            growth: 2,
            riskPct: undefined,
            rmultiple: undefined,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
    ];
    it("can analyze multiple trades with loss and profit", () => {
        const analysis = analyze_1.analyze(20, aLossThenAProfit);
        chai_1.expect(analysis.startingCapital).to.eql(20);
        chai_1.expect(analysis.finalCapital).to.eql(20);
        chai_1.expect(analysis.profit).to.eql(0);
        chai_1.expect(analysis.profitPct).to.eql(0);
        chai_1.expect(analysis.growth).to.eql(1);
        chai_1.expect(analysis.barCount).to.eql(15);
        chai_1.expect(analysis.maxRiskPct).to.eql(undefined);
    });
    it("single trade with profit has no drawdown", () => {
        const analysis = analyze_1.analyze(10, [aProfit]);
        chai_1.expect(analysis.maxDrawdown).to.eql(0);
        chai_1.expect(analysis.maxDrawdownPct).to.eql(0);
    });
    it("single trade with loss sets the drawdown to the loss", () => {
        const analysis = analyze_1.analyze(10, [aLoss]);
        chai_1.expect(analysis.maxDrawdown).to.eql(-5);
        chai_1.expect(analysis.maxDrawdownPct).to.eql(-50);
    });
    it("drawdown from first loss is not override by subsequent profit", () => {
        const analysis = analyze_1.analyze(20, aLossThenAProfit);
        chai_1.expect(analysis.maxDrawdown).to.eql(-10);
        chai_1.expect(analysis.maxDrawdownPct).to.eql(-50);
    });
    const threeSampleTradesEndingInALoss = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 20,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 10,
            profit: -10,
            profitPct: -50,
            growth: 0.5,
            riskPct: 50,
            rmultiple: -1,
            holdingPeriod: 5,
            exitReason: "Sell",
        },
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/11/1"),
            entryPrice: 10,
            exitTime: makeDate("2018/11/10"),
            exitPrice: 30,
            profit: 20,
            profitPct: 200,
            growth: 3,
            riskPct: 50,
            rmultiple: 4,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/12/1"),
            entryPrice: 30,
            exitTime: makeDate("2018/12/5"),
            exitPrice: 15,
            profit: -15,
            profitPct: -50,
            growth: 0.5,
            riskPct: 50,
            rmultiple: -1,
            holdingPeriod: 5,
            exitReason: "Sell",
        },
    ];
    const threeSampleTradesEndingInAProfit = [
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/10/25"),
            entryPrice: 20,
            exitTime: makeDate("2018/10/30"),
            exitPrice: 10,
            profit: 10,
            profitPct: 100,
            growth: 2,
            riskPct: 50,
            rmultiple: -1,
            holdingPeriod: 5,
            exitReason: "Sell",
        },
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/11/1"),
            entryPrice: 10,
            exitTime: makeDate("2018/11/10"),
            exitPrice: 30,
            profit: 20,
            profitPct: 200,
            growth: 3,
            riskPct: 50,
            rmultiple: 4,
            holdingPeriod: 10,
            exitReason: "Sell",
        },
        {
            direction: strategy_1.TradeDirection.Long,
            entryTime: makeDate("2018/12/1"),
            entryPrice: 30,
            exitTime: makeDate("2018/12/5"),
            exitPrice: 15,
            profit: -15,
            profitPct: -50,
            growth: 0.5,
            riskPct: 50,
            rmultiple: -1,
            holdingPeriod: 5,
            exitReason: "Sell",
        },
    ];
    it("drawdown resets on peak", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(analysis.maxDrawdown).to.eql(-15);
        chai_1.expect(analysis.maxDrawdownPct).to.eql(-50);
    });
    it("total number of trades is recorded", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(analysis.totalTrades).to.eql(3);
    });
    it("proportion profitable is computed", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(round(analysis.proportionProfitable)).to.eql(0.33);
    });
    it("percent profitable is computed", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(round(analysis.percentProfitable)).to.eql(33.33);
    });
    it("profit factor is computed with profits and losses", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(analysis.profitFactor).to.eql(0.8);
    });
    it("profit factor is computed with only a profit", () => {
        const analysis = analyze_1.analyze(20, [aProfit]);
        chai_1.expect(analysis.profitFactor).to.eql(undefined);
    });
    it("profit factor is computed with only a loss", () => {
        const analysis = analyze_1.analyze(20, [aLoss]);
        chai_1.expect(analysis.profitFactor).to.eql(0);
    });
    it("expectency is computed", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(round(analysis.expectency)).to.eql(0.67);
    });
    it("rmultiple std dev is computed", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(round(analysis.rmultipleStdDev)).to.eql(2.89);
    });
    it("system quality is computed with profits and lossses", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(round(analysis.systemQuality)).to.eql(0.23);
    });
    it("system quality is undefined with only a single profit", () => {
        const analysis = analyze_1.analyze(20, [aProfit]);
        chai_1.expect(analysis.systemQuality).to.eql(undefined);
    });
    it("system quality is undefined with only a single loss", () => {
        const analysis = analyze_1.analyze(20, [aLoss]);
        chai_1.expect(analysis.systemQuality).to.eql(undefined);
    });
    it("return on account is computed for a profit", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInAProfit);
        chai_1.expect(analysis.returnOnAccount).to.eql(4);
    });
    it("return on account is computed for a loss", () => {
        const analysis = analyze_1.analyze(20, threeSampleTradesEndingInALoss);
        chai_1.expect(analysis.returnOnAccount).to.eql(-0.5);
    });
    it("can compute average profit per trade", () => {
        const analysis = analyze_1.analyze(10, twoProfits);
        chai_1.expect(analysis.averageProfitPerTrade).to.eql(25);
    });
    it("can compute average profit for winning trades", () => {
        const analysis = analyze_1.analyze(10, twoProfits);
        chai_1.expect(analysis.averageWinningTrade).to.eql(25);
    });
    it("can compute average profit for losing trades", () => {
        const analysis = analyze_1.analyze(10, twoLosses);
        chai_1.expect(analysis.averageLosingTrade).to.eql(-6);
    });
    it("can compute positive expected value", () => {
        const analysis = analyze_1.analyze(10, twoProfits);
        chai_1.expect(analysis.expectedValue).to.eql(25);
    });
    it("can compute negative expected value", () => {
        const analysis = analyze_1.analyze(10, twoLosses);
        chai_1.expect(analysis.expectedValue).to.eql(-6);
    });
});
//# sourceMappingURL=analyze.test.js.map