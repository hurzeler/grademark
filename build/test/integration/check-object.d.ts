import { IDataFrame } from 'data-forge';
import 'data-forge-fs';
export declare function writeDataFrame(filePath: string, dataFrame: IDataFrame<any, any>): void;
export declare function readDataFrame<IndexT = any, ValueT = any>(filePath: string): IDataFrame<IndexT, ValueT>;
export declare function checkArrayExpectations<T>(array: T[], test: any): void;
export declare function checkObjectExpectations(obj: any, test: any): void;
export declare function checkArray(array: any[], spec: any[], fieldPath?: string): void;
export declare function checkObject(obj: any, spec: any, fieldPath?: string): void;
