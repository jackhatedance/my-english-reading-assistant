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

    it('harassing', function () {
      assert.equal(isRegularTransform("harass", "harassing"), true);
    });

    it('digging', function () {
      assert.equal(isRegularTransform("dig", "digging"), true);
    });

    it('giving', function () {
      assert.equal(isRegularTransform("give", "giving"), true);
    });

    it('wiped', function () {
      assert.equal(isRegularTransform("wipe", "wiped"), true);
    });

    it('closer', function () {
      assert.equal(isRegularTransform("close", "closer"), true);
    });

    it('closest', function () {
      assert.equal(isRegularTransform("close", "closest"), true);
    });

    it('densely', function () {
      assert.equal(isRegularTransform("dense", "densely"), true);
    });

    it('merchantmen', function () {
      assert.equal(isRegularTransform("merchantman", "merchantmen"), true);
    });

  });
  
});
