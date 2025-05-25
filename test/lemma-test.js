import { strict as assert } from 'assert';
import { isRegularTransform } from '../src/lemma.js'

describe('lemma', function () {
  describe('isRegularTransform', function () {
    it('tugged', function () {
      assert.equal(isRegularTransform("tug", "tugged"), true);
    });

    it('levies', function () {
      assert.equal(isRegularTransform("levy", "levies"), true);
    });
  });
  
});
