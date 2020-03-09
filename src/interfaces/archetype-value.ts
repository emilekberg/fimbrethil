import { Hash } from '../entity-id';

export interface IArchetypeValue<T> {
  hash: Hash;
  constructors: T
}
