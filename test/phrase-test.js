import { strict as assert } from 'assert';
import { findPhrase } from '../src/phrase.js'

describe('phrase', function () {
  describe('findPhrase', function () {
    it('give up', function () {
      assert.equal(findPhrase("I give up swiming", 1, ['give up','give in']), 'give up');
    });

  });
  
});
