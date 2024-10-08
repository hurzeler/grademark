import { ITrade } from "./trade";
import { IDataFrame } from 'data-forge';
import { IStrategy, IBar } from "..";
/**
 * Options to the backtest function.
 */
export interface IBacktestOptions {
    /**
     * Enable recording of the stop price over the holding period of each trade.
     * It can be useful to enable this and visualize the stop loss over time.
     */
    recordStopPrice?: boolean;
    /**
     * Enable recording of the risk over the holding period of each trade.
     * It can be useful to enable this and visualize the risk over time.
     */
    recordRisk?: boolean;
}
/**
 * Backtest a trading strategy against a data series and generate a sequence of trades.
 */
export declare function backtest<InputBarT extends IBar, IndicatorBarT extends InputBarT, ParametersT, IndexT>(strategy: IStrategy<InputBarT, IndicatorBarT, ParametersT, IndexT>, inputSeries: IDataFrame<IndexT, InputBarT>, options?: IBacktestOptions): ITrade[];
