import { strict as assert } from 'assert';
import { findPhrase } from '../src/phrase.js'

describe('phrase', function () {
  describe('findPhrase', function () {
    it('phrase give up', function () {
      assert.equal(findPhrase("I give up swiming", 1, ['give up','give in']), 'give up');
    });

    it('phrase all in', function () {
      assert.equal(findPhrase("I am all in swiming", 3, ['all in','in on']), 'all in');
    });

  });
  
});
