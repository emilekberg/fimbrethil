# fimbrethil

![Node.js CI](https://github.com/emilekberg/fimbrethil/workflows/Node.js%20CI/badge.svg)

fimbrethil is a ECS for javascript and typescript.

## Components

Components are pure data containers and should not contain any logic. 
The logic should be put into systems.
When adding a component to an entity, all properties can always be set with as an optional parameter which is `Partial<Component>`. 

Behind the scenes Components are stored in groups called `Archetypes`.
There is one archetype for every permutation of component groups. However, `A,B,C` and `C,B,A` are the same archetype.

```typescript
class Transform extends Component {
  x: number = 0;
  y: number = 0;
}
registerComponent(Transform);

class Velocity extends Component {
  x: number = 0;
  y: number = 0;
}
registerComponent(Velocity);
```

## System

Systems are highorder functions, returning the ticker method. There are two kinds of systems. `Tickers` and `Renders`.

### Tickers
Tickers are designed to run at a fixed interval, such as 30 times per second.

```typescript
function mover(world: IWorld) {
  const componentTypes = Archetype.create(Transform, Velocity);
  return (timestep: number) => {
    world.query((transform, velocity) => {
      transform.x += velocity.x * timestep;
      transform.y += velocity.y * timestep;
    }, componentTypes);
  };
}
world.add(mover);
```

### Renders

Renders are designed to run freely at the refresh rate of the monitor, for instance, such as 60fps or 144fps.
They can also accept a interpolation parameter. Which can be used to interpolate frames if needed. This is optional however.

```typescript
interface IRenderOptions {
  renderer: Renderer;
};
function renderer(world: IWorld, options: IRenderOptions) {
  const componentTypes = Archetype.create(Transform, Sprite);
  return (deltatime: number, interpolation?: number) => {
    world.query((transform, sprite) => {
      renderer.render(sprite, transform);
    }, componentTypes);
  };
}

// pass an imaginary renderer to the system.
world.addRender(render, {renderer: new Renderer()});
```

## Entities

Entities are just a single `number` identifyin the entity.
They are nothing else. Entities are also used to refer to children or other similar entities which share a relation to an entity. 

```typescript
const id = world.createEntity()
  .with(Transform)
  .with(Velocity, {
    x: 100,
    y: 150
  })
  .build();
```

## Examples

For further examples, see the example directory.
