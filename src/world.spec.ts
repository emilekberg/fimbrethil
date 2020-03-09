import World from './world'
import { expect } from 'chai';
import { IWorld } from './interfaces/world';
import Archetype from './archetype';
import Component, { registerComponent } from './components/component';
import { Test } from 'mocha';

class TestComponent extends Component {
  one: number = 1;
  field: string = "hello from a component";
}
registerComponent(TestComponent);
interface ITestSystemOptions {
  counter: number;
}
function TestSystem(world: IWorld, options?: ITestSystemOptions) {
  return (timestep: number) => {
    if(!options) {
      throw new Error("something went wrong when adding options");
    }
    options.counter += timestep;
  }
}
class A extends Component { 
  identifier: string = "a";
};
class B extends Component { };
class C extends Component { };
class D extends Component { };
registerComponent(A);
registerComponent(B);
registerComponent(C);
registerComponent(D);
describe('ecs', function () {
  describe('world', function () {
    describe('tick', function() {
      it('not throw if no systems are added', function() {
        expect(function() {
          const world = new World();
          world.tick(5);
        }).to.not.throw();
      });
      it('should call tick on registered systems', function() {
        const obj = {
          counter: 0
        };
        const world: IWorld = new World();
        world.add(TestSystem, obj);
        world.tick(5);
        expect(obj.counter).to.equal(5);
      });
    });
    describe('addComponent', function() {
      it('should throw if entity does not exist', function() {
        expect(function() {
          const world = new World();
          world.addComponent(5, TestComponent);
        }).to.throw();
      });
      it('should throw if no string component is found', function() {
        expect(function() {
          const world = new World();
          world.createEntity().build();
          world.addComponent(1, 'NotFoundComponent');
        }).to.throw();
      });
      it('should not throw if string component is found', function() {
        expect(function() {
          const world = new World();
          world.createEntity().build();
          world.addComponent(1, 'TestComponent');
        }).to.not.throw();
      });
      it('should be able to query added string component', function() {
        const world = new World();
        const id = world.createEntity().build();
        world.addComponent<TestComponent>(id, 'TestComponent', {
          field: 'tjena'
        });
        world.query((test) => {
          expect(test.field).to.equal('tjena');
        }, Archetype.create(TestComponent));
      });
    });
    describe('createEntity', function () {
      it('creates entity with options', function () {
        const world = new World();
        world.createEntity()
          .with(TestComponent, {
            field: 'My overriden text'
          })
          .build();

        world.query((test) => {
          expect(test.field).to.equal('My overriden text');
        }, Archetype.create(TestComponent));
      });
      it('builds from json', function() {
        let called = false;
        const world = new World();
        world.createEntity()
          .fromJson({
            A: {
              identifier: 'nissepelle'
            },
            TestComponent: {},
            B: {}
          })
          .build();
        const components = Archetype.create(A, TestComponent, B);
        world.query((a,test,b) => {
          expect(a.constructor.name).to.equal("A");
          expect(test.constructor.name).to.equal("TestComponent");
          expect(b.constructor.name).to.equal("B");
          called = true;
        }, components);
        expect(called).to.be.true;
      });
    });
    describe('query', function () {
      it('should query when components exists', function () {
        const world = new World();
        world.createEntity()
          .with(TestComponent)
          .build();
        let counter = 0;
        let tester: string | undefined;
        world.query((test) => {
          counter += 1;
          tester = test.field;
        }, Archetype.create(TestComponent));

        expect(counter).to.equal(1);
        expect(tester).to.exist.and.equal("hello from a component");
      });

      it('should call 4 times for 4 components', function () {
        let calls = 0;
        const world = new World();
        const iterations = 4;
        for (let i = 0; i < iterations; i += 1) {
          world.createEntity()
            .with(TestComponent)
            .build();
        }
        world.query((test) => {
          expect(test).to.exist;
          calls += test.one;
        }, Archetype.create(TestComponent));
        expect(calls).to.equal(iterations);
      });
 
      it('should return each requested component', function () {
        const world = new World();
        world.createEntity()
          .with(A)
          .with(B)
          .with(C)
          .with(D)
          .build();

        world.query((a, b, c, d) => {
          expect(a).to.exist;
          expect(b).to.exist;
          expect(c).to.exist;
          expect(d).to.exist;
          expect(a.constructor.name).to.equal("A");
          expect(b.constructor.name).to.equal("B");
          expect(c.constructor.name).to.equal("C");
          expect(d.constructor.name).to.equal("D");
        }, Archetype.create(A, B, C, D));
      });

      it('loop the correct components', function () {

        let ab = 0;
        let bc = 0;
        let cd = 0;
        let ad = 0;
        const world = new World();

        world.createEntity()
          .with(A)
          .with(B)
          .build();

        world.createEntity()
          .with(A)
          .with(B)
          .build();

        world.createEntity()
          .with(C)
          .with(D)
          .build();

        world.createEntity()
          .with(A)
          .with(D)
          .build();

        world.query((a, b) => {
          ab += 1;
        }, Archetype.create(A, B));

        world.query((b, c) => {
          bc += 1;
        }, Archetype.create(B, C));

        world.query((c, d) => {
          cd += 1;
        }, Archetype.create(C, D));

        world.query((a, d) => {
          ad += 1;
        }, Archetype.create(A, D));

        expect(ab).to.equal(2);
        expect(bc).to.equal(0);
        expect(cd).to.equal(1);
        expect(ad).to.equal(1);
      });
      it('finds common component in different archetypes', function() {
        const world = new World();
        world.createEntity()
          .with(A, {
            identifier: "adam"
          })
          .build();
        world.createEntity()
          .with(A, {
            identifier: "bravo"
          })
          .with(B)
          .build();
        world.createEntity()
          .with(A, {
            identifier: "ceta"
          })
          .with(B)
          .with(C)
          .build();
        let counter = 0;
        let str = '';
        const val = Archetype.create(A);
        world.query((a) => {
          counter += 1;
          str += a.identifier + '.';
        }, val);

        expect(counter).to.equal(3);
        expect(str).to.equal('adam.bravo.ceta.');
      });
    });

    describe('removeComponent', function() {
      it('should not call for removed components', function() {
        const world = new World();
        const entity1 = world.createEntity()
          .with(A)
          .with(B)
          .with(C)
          .build();
        world.createEntity()
          .with(A)
          .with(B)
          .with(C)
          .build();

        world.removeComponent(entity1, B);

        let counter = 0;
        const hash = Archetype.create(A,B,C);
        world.query((a,b,c) => {
          counter += 1;
        }, hash);
        expect(counter).to.equal(1);
      });
    })
  });
});