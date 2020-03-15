
import GenericBuilder from './generic-builder';
import { IComponent, ComponentConstructor } from './interfaces/component';
import Component from './components/component';
import { registerComponent } from './component-utils';
import { expect } from 'chai';

describe('generic-builder', function () {
  class AAA extends Component { };
  class BBB extends Component { };
  describe('withChild', function () {
    it('constructs', function () {
      const builder = GenericBuilder<ComponentConstructor<IComponent>>(() => 1, (id, components) => {
        expect(components).to.deep.equal([
          AAA,
          BBB
        ]);
      });
      builder
        .with(AAA)
        .with(BBB)
        .build();
    });

    it('builds with children',function() {
      let i = 0;
      const builder = GenericBuilder<ComponentConstructor<IComponent>>(() => ++i, (id, components) => {

      });
      builder.withChild('child', child => child);
      builder.build();
    });

  });
});
