import { IComponent } from '../interfaces/component';
import { EntityId } from '../entity-id';
import { Hash } from "../hash";

export default class Component implements IComponent {
  public static hash: Hash = -1;

  readonly entityId: EntityId;

  constructor(entityId: EntityId) {
    this.entityId = entityId;
  }
}
