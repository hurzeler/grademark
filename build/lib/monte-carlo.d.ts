import { ITrade } from "..";
/**
 * Options to the monteCarlo function.
 */
export interface IMonteCarloOptions {
    /**
     * Starting seed for the random number generator.
     */
    randomSeed?: number;
}
/**
 * Perform a monte carlo simulation on a set of trades.
 * Produces a set of X samples of Y trades from the full population.
 * X = numIterators.
 * Y = numSamples
 */
export declare function monteCarlo(trades: ITrade[], numIterations: number, numSamples: number, options?: IMonteCarloOptions): ITrade[][];
