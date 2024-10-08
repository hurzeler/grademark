import { IBar } from "./bar";
import { IDataFrame } from "data-forge";
import { ITrade } from "./trade";
import { IStrategy } from "./strategy";
/**
 * Defines a function that selects an objective value to measure the performance of a set of trades.
 */
export declare type ObjectiveFn = (trades: ITrade[]) => number;
/**
 * What is the best value of the objective function?
 */
export declare type OptimizeSearchDirection = "max" | "min";
/**
 * Defines the parameter to optimize for.
 */
export interface IParameterDef {
    /**
     * The name of the parameter.
     */
    name: string;
    /**
     * The starting value of the parameter.
     */
    startingValue: number;
    /**
     * The ending value of the parameter.
     */
    endingValue: number;
    /**
     * Amount to step the parameter with each iteration of the optimziation.
     */
    stepSize: number;
}
export declare type OptimizationType = "grid" | "hill-climb";
/**
 * Options to the optimize function.
 */
export interface IOptimizationOptions {
    /**
     * Determine the direction we are optimizating for when looking out the object function.
     */
    searchDirection?: OptimizeSearchDirection;
    /**
     * Sets the type of algoritm used for optimization.
     * Defaults to "grid".
     */
    optimizationType?: OptimizationType;
    /**
     * Record all results from all iterations.
     */
    recordAllResults?: boolean;
    /**
     * Starting seed for the random number generator.
     */
    randomSeed?: number;
    /**
     * The number of starting points to consider for the hill climb algorithm.
     * The more starting point the better chance of getting an optimal result, but it also makes the algo run slower.
     */
    numStartingPoints?: number;
    /**
     * Record the duration of the optimization algorithm.
     */
    recordDuration?: boolean;
}
export declare type IterationResult<ParameterT> = (ParameterT & {
    result: number;
    numTrades: number;
});
/**
 * Result of a multi-parameter optimisation.
 */
export interface IOptimizationResult<ParameterT> {
    /**
     * The best result that was found in the parameter space.
     */
    bestResult: number;
    /**
     * Best parameter values produced by this optimization.
     */
    bestParameterValues: ParameterT;
    /**
     * Results of all iterations of optimizations.
     */
    allResults?: IterationResult<ParameterT>[];
    /**
     * The time taken (in milliseconds) by the optimization algorithm.
     */
    durationMS?: number;
}
/**
 * Perform an optimization over multiple parameters.
 */
export declare function optimize<InputBarT extends IBar, IndicatorBarT extends InputBarT, ParameterT, IndexT>(strategy: IStrategy<InputBarT, IndicatorBarT, ParameterT, IndexT>, parameters: IParameterDef[], objectiveFn: ObjectiveFn, inputSeries: IDataFrame<IndexT, InputBarT>, options?: IOptimizationOptions): IOptimizationResult<ParameterT>;
