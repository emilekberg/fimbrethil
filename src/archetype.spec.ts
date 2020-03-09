import ArcheType from './archetype';
import { expect } from "chai";
import Component, { registerComponent } from './components/component';
describe('ecs', function () {
  describe('archtype', function () {
    describe('hash', function () {
      class AA extends Component { };
      registerComponent(AA);
      class BB extends Component { };
      registerComponent(BB);
      it('calculates hash without throwing', function () {
        expect(function () {
          const aHash = ArcheType.calculateHash([AA]);
          const bHash = ArcheType.calculateHash([BB]);
          const abHash = ArcheType.calculateHash([AA, BB]);
        }).to.not.throw();
      });

      it('calculates different hashes for differnet combinations', function () {
        const aHash = ArcheType.calculateHash([AA]);
        const bHash = ArcheType.calculateHash([BB]);
        const abHash = ArcheType.calculateHash([AA, BB]);
        expect(aHash).to.not.be.oneOf([bHash, abHash]);
      });
    });
  });
});

