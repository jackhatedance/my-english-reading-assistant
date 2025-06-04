import { strict as assert } from 'assert';
import { isRegularTransform } from '../src/lemma.js'

describe('lemma', function () {
  describe('isRegularTransform', function () {
    it('boys', function () {
      assert.equal(isRegularTransform("boy", "boys"), true);
    });

    it('tugged', function () {
      assert.equal(isRegularTransform("tug", "tugged"), true);
    });

    it('levies', function () {
      assert.equal(isRegularTransform("levy", "levies"), true);
    });

    it('harasing', function () {
      assert.equal(isRegularTransform("harass", "harassing"), true);
    });

    it('digging', function () {
      assert.equal(isRegularTransform("dig", "digging"), true);
    });

    it('wiped', function () {
      assert.equal(isRegularTransform("wipe", "wiped"), true);
    });
  });
  
});
