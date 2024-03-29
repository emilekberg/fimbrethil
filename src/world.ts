import type { IComponent, ComponentConstructor } from './interfaces/component.js';
import { SystemFactory, SystemTicker, SystemRender } from './interfaces/system.js';
import GenericBuilder from './generic-builder.js';
import Archetype from './archetype.js';
import { IWorld, RetStuff } from './interfaces/world.js';
import { IArchetypeValue } from './interfaces/archetype-value.js';
import { EntityId } from './entity-id.js';
import { createComponent } from './component-utils.js';
import { Hash } from './hash.js';

export default class World implements IWorld {
  private entities: Set<EntityId>;

  private entityArchetype: Record<EntityId, number>;

  public entityIdCounter: EntityId;

  private systems: SystemTicker[];

  private renderSystems: SystemRender[];

  private archetypes: Archetype[];

  private onAddCallbacks: Record<Hash, Array<(component: IComponent) => void>>;

  private onRemoveCallbacks: Record<Hash, Array<(component: IComponent) => void>>;

  constructor() {
    this.entities = new Set();
    this.entityArchetype = {};
    this.entityIdCounter = 0;
    this.systems = [];
    this.renderSystems = [];
    this.archetypes = [];
    this.onAddCallbacks = {};
    this.onRemoveCallbacks = {};
  }

  onComponentAdded<T extends IComponent>(type: ComponentConstructor<T>, callback: (component: T) => void) {
    if (this.onAddCallbacks[type.hash] === undefined) {
      this.onAddCallbacks[type.hash] = [];
    }
    this.onAddCallbacks[type.hash].push(callback as any);
  }

  onComponentRemoved<T extends IComponent>(type: ComponentConstructor<T>, callback: (component: T) => void) {
    if (this.onRemoveCallbacks[type.hash] === undefined) {
      this.onRemoveCallbacks[type.hash] = [];
    }
    this.onRemoveCallbacks[type.hash].push(callback as any);
  }

  add(systemFactory: SystemFactory<SystemTicker, unknown>, options?: unknown): IWorld {
    this.systems.push(systemFactory(this, options));
    return this;
  }

  addRenderer(systemFactory: SystemFactory<SystemRender, unknown>, options?: unknown): IWorld {
    this.renderSystems.push(systemFactory(this, options));
    return this;
  }

  tick(timestep: number) {
    this.systems.forEach((system) => system(timestep));
  }

  render(deltaTime: number, interpolation: number) {
    this.renderSystems.forEach((system) => {
      system(deltaTime, interpolation);
    });
  }

  hasEntity(id: EntityId): boolean {
    return this.entities.has(id);
  }

  hasComponent<T extends IComponent>(id: EntityId, ctor: ComponentConstructor<T>): boolean {
    const index = this.entityArchetype[id];
    if (index === undefined) {
      return false;
    }
    return this.archetypes[index].hasHash(ctor.hash);
  }

  getComponent<T extends IComponent>(id: EntityId, ctor: ComponentConstructor<T>): T|undefined {
    const index = this.entityArchetype[id];
    if (index === undefined) {
      return undefined;
    }
    return this.archetypes[index].getHash<T>(id, ctor.hash);
  }

  /**
   * Creates a new entity and returns a builder for it.
   * Once done, parses the component from the builder and adds to the correct archetype.
   */
  createEntity() {
    // eslint-disable-next-line no-plusplus
    const getId = () => ++this.entityIdCounter;

    return GenericBuilder<ComponentConstructor<IComponent>>(getId, (id, componentTypes, options) => {
      this.entities.add(id);
      // sort to make sure hashing is the same for different created components.
      const instances: Record<string, IComponent> = {};
      const constructors: ComponentConstructor<IComponent>[] = [];
      componentTypes.forEach((component, i) => {
        const instance = this.addComponent(id, component, options[i] as any, false);
        const constructor = (instance.constructor as ComponentConstructor<IComponent>);
        constructors.push(constructor);
        instances[constructor.hash] = instance;
      });

      this.addEntityToArchetype(id, constructors, instances);
      Object.keys(instances).forEach((key) => {
        this.callOnAdd(instances[key]);
      });
    });
  }

  removeEntity(id: EntityId) {
    this.entities.delete(id);
    this.archetypes.forEach((archetype) => {
      archetype.remove(id);
    });
    delete this.entityArchetype[id];
  }

  private callOnAdd(instance: IComponent) {
    const hash = (instance.constructor as ComponentConstructor<IComponent>).hash;
    if (this.onAddCallbacks[hash]) {
      this.onAddCallbacks[hash].forEach((cb) => {
        cb(instance);
      });
    }
  }

  addComponent<T extends IComponent>(
    id: EntityId,
    component: ComponentConstructor<T> | string,
    opts?: Partial<T>,
    parseArchetypes: boolean = true,
  ) {
    if (!this.entities.has(id)) {
      throw new Error(`entity with id ${id} is not created`);
    }
    const instance = this.getNewComponentInstance(component, id);
    Object.assign(instance, opts);
    if (parseArchetypes) {
      this.updateArchetype(id, instance);
      this.callOnAdd(instance);
    }

    return instance;
  }

  // eslint-disable-next-line class-methods-use-this
  getNewComponentInstance(component: ComponentConstructor<IComponent> | string, id: EntityId) {
    if (typeof component === 'string') {
      return createComponent(component, id);
    }
    const Constructor = component;
    return new Constructor(id);
  }

  removeComponent(id: EntityId, component: ComponentConstructor<IComponent>) {
    const components = this.removeEntityFromArchetype(id);
    if (!components) {
      return;
    }
    delete components[component.hash];
    const componentTypes = [
      ...Object.values(components),
    ].map((x) => x.constructor as ComponentConstructor<IComponent>);
    this.addEntityToArchetype(id, componentTypes, components);
  }

  updateArchetype(id: EntityId, component: IComponent) {
    const components = this.removeEntityFromArchetype(id);
    if (!components) {
      return;
    }
    components[(component.constructor as ComponentConstructor<IComponent>).hash] = component;
    const componentTypes = [
      ...Object.values(components),
    ].map((x) => x.constructor as ComponentConstructor<IComponent>);
    this.addEntityToArchetype(id, componentTypes, components);
  }

  addEntityToArchetype(
    id: EntityId,
    componentTypes: ComponentConstructor<IComponent>[],
    components: Record<string, IComponent>,
  ) {
    const hash = Archetype.calculateHash(componentTypes);
    let index = this.archetypes.findIndex((a) => a.is(hash));

    if (index === -1) {
      index = this.archetypes.push(new Archetype(componentTypes)) - 1;
    }
    this.entityArchetype[id] = index;
    this.archetypes[index].add(id, components);
  }

  removeEntityFromArchetype(id: EntityId): Record<string, IComponent> | undefined {
    const index = this.archetypes.findIndex((a) => a.hasEntity(id));
    if (index === -1) {
      return undefined;
    }
    delete this.entityArchetype[id];
    return this.archetypes[index].remove(id);
  }

  query<T extends ComponentConstructor<IComponent>[]>(
    cb: (...a: RetStuff<T>) => void, hash: IArchetypeValue<T>,
  ) {
    this.archetypes.forEach((archetype) => {
      if (!archetype.has(hash)) {
        return;
      }
      archetype.entities.forEach((id) => {
        const components = archetype.get(id, hash);
        // eslint-disable-next-line
        cb.apply(undefined, components as any);
      });
    });
  }

  fromEntityId<T extends ComponentConstructor<IComponent>[]>(
    id: number, cb: (...a: RetStuff<T>) => void, hash: IArchetypeValue<T>,
  ) {
    const index = this.entityArchetype[id];
    if (index === undefined) {
      return;
    }
    const components = this.archetypes[index].get(id, hash);
    // eslint-disable-next-line
    cb.apply(undefined, components as any);
  }
}
