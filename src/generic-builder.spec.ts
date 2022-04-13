
import GenericBuilder from './generic-builder.js';
import type { IComponent, ComponentConstructor } from './interfaces/component.js';
import Component from './components/component.js';
import { expect } from 'chai';
import { Children, Parent } from './components/index.js';

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
      const expected = [
        [AAA, Children],
        [Parent, BBB],
      ];
      const builder = GenericBuilder<ComponentConstructor<IComponent>>(() => i++, (id, components) => {
        expect(components).to.deep.equal(expected[id]);
      });
      builder
      .with(AAA)
      .withChild('child', child => child
        .with(BBB)
      ).build();
      expect(i).to.equal(2);
    });

  });
});
