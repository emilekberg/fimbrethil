import Archetype from './archetype';
import Component, { registerComponent, createComponent } from './components/component';
import GenericBuilder from './generic-builder';
import World from './world';

export * from './entity-id';
export * from './interfaces/index';
export * from './components/index';

export {
  Archetype,
  Component,
  GenericBuilder,
  World,
  registerComponent,
  createComponent
};
