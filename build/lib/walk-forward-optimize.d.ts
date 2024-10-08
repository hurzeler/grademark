import { IBar } from "./bar";
import { IDataFrame } from "data-forge";
import { ITrade } from "./trade";
import { IStrategy } from "./strategy";
import { IParameterDef, ObjectiveFn, IOptimizationOptions } from "./optimize";
/**
 * Records the result of an optimization.
 */
export interface IOptimizationResult {
    /**
     * Records the out of sample trades from the walk forward optimization.
     */
    trades: ITrade[];
}
/**
 * Perform a walk-forward optimization over a single parameter.
 */
export declare function walkForwardOptimize<InputBarT extends IBar, IndicatorBarT extends InputBarT, ParameterT, IndexT>(strategy: IStrategy<InputBarT, IndicatorBarT, ParameterT, IndexT>, parameters: IParameterDef[], objectiveFn: ObjectiveFn, inputSeries: IDataFrame<IndexT, InputBarT>, inSampleSize: number, outSampleSize: number, options?: IOptimizationOptions): IOptimizationResult;
