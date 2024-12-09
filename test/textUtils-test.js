
import {trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters} from '../src/text/textUtils.js';
import { strict as assert } from 'assert';

describe('textUtils', function () {
  describe('#trimPunctuations()', function () {
    it('word contains single quotation', async function () {
      assert.equal(trimPunctuations("didn't"), "didn't");
    });

    it('word contains bracket', async function () {
      assert.equal(trimPunctuations("did[0]"), "did");
    });

    it('word contains asterisk', async function () {
      assert.equal(trimPunctuations("did*"), "did");
    });

    it('word contains hash', async function () {
      assert.equal(trimPunctuations("did#"), "did");
    });

    it('word contains plus', async function () {
      assert.equal(trimPunctuations("did+"), "did");
    });

    it('word contains equal', async function () {
      assert.equal(trimPunctuations("did="), "did");
    });

    it('word contains horizontal ellipsis', async function () {
      assert.equal(trimPunctuations("did…"), "did");
    });

    it('word ends with many dots', async function () {
      assert.equal(trimPunctuations("did................"), "did.");
    });



  });

  describe('#sameLengthStandardizeCharacters()', function () {
    it('single quotations', async function () {
      assert.equal(sameLengthStandardizeCharacters("‘did"), "'did");
      assert.equal(sameLengthStandardizeCharacters("did’"), "did'");
      assert.equal(sameLengthStandardizeCharacters("`did"), "'did");
    });

    it('asterisk 2', async function () {
      assert.equal(sameLengthStandardizeCharacters("did∗"), "did*");
    });

    
    
  });

  describe('#variableLengthStandardizeCharacters()', function () {
    
    it('latin small ligature - fi', async function () {
      assert.equal(variableLengthStandardizeCharacters("ﬁ"), "fi");
    });

    it('latin small ligature - fl', async function () {
      assert.equal(variableLengthStandardizeCharacters("ﬂ"), "fl");
    });

    it('a¨', async function () {
      assert.equal(variableLengthStandardizeCharacters("a¨"), "ä");
    });

    it('o¨', async function () {
      assert.equal(variableLengthStandardizeCharacters("o¨"), "ö");
    });

    it('u¨', async function () {
      assert.equal(variableLengthStandardizeCharacters("u¨"), "ü");
    });
    
  });
  
});
