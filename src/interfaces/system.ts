// eslint-disable-next-line import/no-cycle
import { IWorld } from './world';

export declare type SystemTicker = (timestep: number) => void;
export declare type SystemRender = (timestep: number, interpolation?: number) => void;
export declare type SystemFactory<T, T2> = (world: IWorld, options: T2) => T;
