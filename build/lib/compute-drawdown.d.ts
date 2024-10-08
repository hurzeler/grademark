import { ITrade } from "./trade";
/**
 * Compute drawdown for a series of trades.
 *
 * @param trades The series of trades to compute drawdown for.
 */
export declare function computeDrawdown(startingCapital: number, trades: ITrade[]): number[];
