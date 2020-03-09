import { Hash, EntityId } from '../entity-id';

export interface IComponent {
  entityId: number;
}
export type ComponentConstructor<T extends IComponent> = {
  new (id: EntityId): T;
  hash: Hash;
};
export type ComponentOptions<T> = Partial<T>;
