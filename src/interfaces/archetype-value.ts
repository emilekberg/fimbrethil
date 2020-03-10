import { Hash } from '../hash';

export interface IArchetypeValue<T> {
  hash: Hash;
  constructors: T
}
