import { ITrade } from "./trade";
/**
 * Compute an equity curve for a series of trades.
 *
 * @param trades The series of trades to compute equity curve for.
 */
export declare function computeEquityCurve(startingCapital: number, trades: ITrade[]): number[];
