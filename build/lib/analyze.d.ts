import { ITrade } from "./trade";
import { IAnalysis } from "./analysis";
/**
 * Analyse a sequence of trades and compute their performance.
 */
export declare function analyze(startingCapital: number, trades: ITrade[]): IAnalysis;
