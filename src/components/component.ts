import { IComponent, ComponentConstructor } from '../interfaces/component';
import { EntityId, Hash } from '../entity-id';

let componentFactory: Map<string, (id: EntityId) => IComponent> = new Map();
let bit: number = 1;
export function registerComponent(ctor: ComponentConstructor<IComponent>) {
  // eslint-disable-next-line no-param-reassign
  ctor.hash = bit;
  bit *= 2;
  const Constructor = ctor;
  componentFactory.set(ctor.name, (id: EntityId) => new Constructor(id));
}
export default class Component implements IComponent {
  public static hash: Hash = -1;

  readonly entityId: EntityId;

  constructor(entityId: EntityId) {
    this.entityId = entityId;
  }
}
export function createComponent(componentName: string, id: EntityId): IComponent | never {
  const ctor = componentFactory.get(componentName);
  if(!ctor) {
    throw new Error(`Component type ${componentName} not registered as a componetn! Cannot construct`);
  }
  const component = ctor(id);
  if (!component) {
    throw new Error(`error while creating component with name ${componentName}`);
  }
  return component;
}
