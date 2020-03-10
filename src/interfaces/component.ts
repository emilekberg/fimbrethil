import { EntityId } from '../entity-id';
import { Hash } from '../hash';

export interface IComponent {
  entityId: number;
}
export type ComponentConstructor<T extends IComponent> = {
  new (id: EntityId): T;
  hash: Hash;
};
export type ComponentOptions<T> = Partial<T>;
