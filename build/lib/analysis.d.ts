/**
 * Represents an analysis of a trading strategy.
 */
export interface IAnalysis {
    /**
     * Starting capital invested in the trading strategy.
     */
    startingCapital: number;
    /**
     * Capital at the end of trading.
     */
    finalCapital: number;
    /**
     * Amount of profit (or loss) made from start to end.
     */
    profit: number;
    /**
     * Amount of profit as a percentage relative to the starting capital.
     */
    profitPct: number;
    /**
     * Amount of growth in the account since the start of trading.
     */
    growth: number;
    /**
     * Total number of trades considered.
     */
    totalTrades: number;
    /**
     * Number of bars within trades.
     * NOTE: Doesn't include time/bars between trades (because that doesn't work with monte carlo simulation).
     */
    barCount: number;
    /**
     * The maximum level of drawdown experienced during trading.
     * This is the cash that is lost from peak to lowest trough.
     */
    maxDrawdown: number;
    /**
     * The maximum level of drawdown experienced during trading as a percentage of capital at the peak.
     * This is percent amount of lost from peak to lowest trough.
     */
    maxDrawdownPct: number;
    /**
     * Maximum amount of risk taken at any point relative expressed as a percentage relative to the
     * size of the account at the time.
     * This is optional and only set when a stop loss is applied in the strategy.
     */
    maxRiskPct?: number;
    expectency?: number;
    rmultipleStdDev?: number;
    systemQuality?: number;
    /**
     * The ratio of wins to losses.
     * Values above 2 are outstanding.
     * Values above 3 are unheard of.
     * Set to undefined if there are no losses.
     */
    profitFactor: number | undefined;
    /**
     * The proportion of trades that were winners.
     * A value in gthe range 0-1.
     */
    proportionProfitable: number;
    /**
     * The percentage of trades that were winners.
     * A value in the range 0-100.
     * This could also be called reliability or accuracy.
     */
    percentProfitable: number;
    /**
     * Ratio of net profit to max drawdown.
     * Useful metric for comparing strategies.
     * The higher the better.
     * Similar to the calmar ratio:
     * http://www.investopedia.com/terms/c/calmarratio.asp
     */
    returnOnAccount: number;
    /**
     * The average profit per trade.
     *
     * = profit / totalTrades
     */
    averageProfitPerTrade: number;
    /**
     * The number of trades in profit.
     */
    numWinningTrades: number;
    /**
     * The number of trades at a loss.
     */
    numLosingTrades: number;
    /**
     * Average profit from winning trades.
     */
    averageWinningTrade: number;
    /**
     * Average profit from losing trades.
     */
    averageLosingTrade: number;
    /**
     * Mathematical expectency.
     * P29 Trading Systems.
     * = % winning * avgh win + % losing * avg los
     * Want this number to be positive.
     * Can be used to rank trading strategies. Higher value is better.
     *
     * https://en.wikipedia.org/wiki/Expected_value
     */
    expectedValue: number;
}
