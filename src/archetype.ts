import type { IComponent, ComponentConstructor } from './interfaces/component.js';
import { IArchetypeValue } from './interfaces/archetype-value.js';
import { EntityId } from './entity-id.js';
import { Hash } from './hash.js';

/**
 * Returns a subset of components per entity.
 * For instance if an archetype contains A,B,C,D and we query with components B,C
 * it should be true.
 */
export default class Archetype {
  static calculateHash(components: ComponentConstructor<IComponent>[]): number {
    let hash = 0;
    for (let i = 0; i < components.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      hash |= components[i].hash;
    }
    return hash;
  }

  static create<T extends ComponentConstructor<IComponent>[]>(
    ...components: T
  ): IArchetypeValue<T> {
    return {
      hash: this.calculateHash([...components]),
      constructors: components,
    };
  }

  entityComponentsHash: Map<EntityId, Map<Hash, IComponent[]>>;

  hash: Hash;

  entities: EntityId[];

  components: Record<EntityId, Record<Hash, IComponent>>;

  constructor(ctors: ComponentConstructor<IComponent>[]) {
    this.entityComponentsHash = new Map();
    this.entities = [];
    this.components = {};
    this.hash = Archetype.calculateHash(ctors);
  }

  get(id: EntityId, value: IArchetypeValue<ComponentConstructor<IComponent>[]>): IComponent[] {
    const entity = this.entityComponentsHash.get(id)!;
    let components = entity.get(value.hash);
    if (components !== undefined) {
      return components;
    }
    components = value.constructors.map((ctor) => this.components[id][ctor.hash]);
    entity.set(value.hash, components);
    return components;
  }

  getHash<T extends IComponent>(id: EntityId, hash: Hash): T|undefined {
    return this.components[id][hash] as T;
  }

  is(hash: Hash) {
    return this.hash === hash;
  }

  hasEntity(id: EntityId) {
    return this.entityComponentsHash.has(id);
  }

  /**
   * Returns true if the hash bit masks match AND filter.
   * @param value the hash to validate against.
   */
  has(value: IArchetypeValue<ComponentConstructor<IComponent>[]>): boolean {
    // eslint-disable-next-line no-bitwise
    return this.hasHash(value.hash);
  }

  hasHash(hash: Hash): boolean {
    return (hash & this.hash) === hash;
  }

  add(id: EntityId, components: Record<Hash, IComponent>) {
    if (this.hasEntity(id)) {
      throw new Error(`entity ${id} already registed in archtype`);
    }
    this.entities.push(id);
    this.entityComponentsHash.set(id, new Map());
    this.components[id] = components;
  }

  remove(id: EntityId) {
    const index = this.entities.indexOf(id);
    if (index === -1) {
      return undefined;
    }
    // clear cache
    this.entityComponentsHash.delete(id);
    this.entities.splice(index, 1);
    const components = this.components[id];
    delete this.components[id];
    return components;
  }
}
