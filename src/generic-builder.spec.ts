import genericBuilder from './generic-builder'
import { expect } from 'chai';
/*describe('EntityBuilder', function() {
  it('should chain', function() {
    expect(function() {
      const builder = genericBuilder<string>(5, () => {});
      builder
        .with("one")
        .with("two")
        .build();
    }).to.not.throw();
  });

  it('should call callback', function() {
    const builder = genericBuilder<string>(5, (components) => {
      expect(components).to.deep.equal([
        "one", "two", "three", "four", "five"
      ]);
    });
    const instance = builder
      .with("one")
      .with("two")
      .with("three")
      .with("four")
      .with("five")
      .build();
    expect(instance).to.equal(5);
});
});
*/