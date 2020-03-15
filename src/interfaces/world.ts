import { GenericBuilderChain } from './generic-builder';
import { ComponentConstructor, IComponent } from './component';
import { IArchetypeValue } from './archetype-value';
// eslint-disable-next-line import/no-cycle
import { SystemFactory, SystemTicker, SystemRender } from './system';
import { EntityId } from '../entity-id';

export declare type RetStuff<C> = {
  [K in keyof C]: C[K] extends ComponentConstructor<infer T> ? T : never
};

export interface IWorld {

  onComponentAdded<T extends IComponent>(type: ComponentConstructor<T>, callback: (component: T) => void): void;
  onComponentRemoved<T extends IComponent>(type: ComponentConstructor<T>, callback: (component: T) => void): void;

  createEntity(): GenericBuilderChain<ComponentConstructor<IComponent>>;
  removeEntity(id: EntityId): void;
  hasEntity(id: EntityId): boolean;
  add<T>(System: SystemFactory<SystemTicker, T>): IWorld;
  add<T>(System: SystemFactory<SystemTicker, T>, options: T): IWorld;
  add(systemFactory: SystemFactory<SystemTicker, unknown>, options?: unknown): IWorld;

  addRenderer<T>(System: SystemFactory<SystemRender, T>): IWorld;
  addRenderer<T>(System: SystemFactory<SystemRender, T>, options: T): IWorld;
  addRenderer(systemFactory: SystemFactory<SystemRender, unknown>, options?: unknown): IWorld;

  tick(timestep: number): void;
  render(deltatime: number, interpolation?: number): void;

  hasEntity(id: EntityId): boolean;
  hasComponent<T extends IComponent>(id: EntityId, ctor: ComponentConstructor<T>): boolean;
  getComponent<T extends IComponent>(id: EntityId, ctor: ComponentConstructor<T>): T|undefined;
  addComponent<T extends IComponent>(
    id: EntityId,
    component: ComponentConstructor<T>,
    opts?: any
  ): void;
  removeComponent(id: number, component: ComponentConstructor<IComponent>): void;
  query<T extends ComponentConstructor<IComponent>[]>(
    cb: (...a: RetStuff<T>) => void, hash: IArchetypeValue<T>
  ): void

  fromEntityId<T extends ComponentConstructor<IComponent>[]>(
    id: EntityId, cb: (...a: RetStuff<T>) => void, { hash, constructors }: IArchetypeValue<T>,
  ): void;
}
