import type { IComponent } from '../interfaces/component.js';
import { EntityId } from '../entity-id.js';
import { Hash } from "../hash.js";

export default class Component implements IComponent {
  public static hash: Hash = -1;

  readonly entityId: EntityId;

  constructor(entityId: EntityId) {
    this.entityId = entityId;
  }
}
