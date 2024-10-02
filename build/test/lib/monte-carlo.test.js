"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const monte_carlo_1 = require("../../lib/monte-carlo");
describe("monte-carlo", () => {
    it("zero trades produces zero samples", () => {
        const trades = [];
        const samples = monte_carlo_1.monteCarlo(trades, 2, 2);
        chai_1.expect(samples.length).to.eql(0);
    });
    it("can produce sequence of samples from population of one", () => {
        const trades = [
            {
                entryPrice: 5
            },
        ];
        const samples = monte_carlo_1.monteCarlo(trades, 3, 2);
        chai_1.expect(samples.length).to.eql(3);
        const first = samples[0];
        chai_1.expect(first.length).to.eql(2);
        chai_1.expect(first[0].entryPrice).to.eql(5);
        chai_1.expect(first[1].entryPrice).to.eql(5);
        const second = samples[1];
        chai_1.expect(second.length).to.eql(2);
        chai_1.expect(second[0].entryPrice).to.eql(5);
        chai_1.expect(second[1].entryPrice).to.eql(5);
        const third = samples[2];
        chai_1.expect(third.length).to.eql(2);
        chai_1.expect(third[0].entryPrice).to.eql(5);
        chai_1.expect(third[1].entryPrice).to.eql(5);
    });
    it("can produce sequence of samples from population", () => {
        const trades = [
            {
                entryPrice: 1
            },
            {
                entryPrice: 2
            },
            {
                entryPrice: 3
            },
            {
                entryPrice: 4
            },
        ];
        const samples = monte_carlo_1.monteCarlo(trades, 4, 3);
        chai_1.expect(samples.length).to.eql(4);
        chai_1.expect(samples).to.eql([
            [
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 3
                }
            ],
            [
                {
                    "entryPrice": 4
                },
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 4
                }
            ],
            [
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 4
                },
                {
                    "entryPrice": 2
                }
            ],
            [
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 3
                },
                {
                    "entryPrice": 2
                }
            ]
        ]);
    });
});
//# sourceMappingURL=monte-carlo.test.js.map