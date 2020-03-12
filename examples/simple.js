const {World, Component, Archetype, registerComponent} = require('../types');

class Health extends Component {
  value = 100;
}
registerComponent(Health);
class Damage extends Component {
  value = 50;
}
registerComponent(Damage);

function damageSystem(world) {
  const componentTypes = Archetype.create(Health, Damage);
  return () => {
    world.query((health, damage) => {
      health.value -= damage.value;
      if(health.value <= 0) {
        world.removeEntity(health.entityId);
      }
    }, componentTypes)
  };
}

const world = new World();
world.add(damageSystem);

const id = world.createEntity()
  .with(Health)
  .with(Damage)
  .build();
console.log(`- world has entity ${id} = ${world.hasEntity(id)}`); // will print true
world.tick();
world.tick();
world.tick();
console.log(`- world has entity ${id} = ${world.hasEntity(id)}`); // will print false