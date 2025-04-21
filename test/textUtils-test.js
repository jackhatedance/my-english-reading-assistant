
import {trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters, removeParentheses} from '../src/text/textUtils.js';
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

    it('word ends with dot and length is less than 6', async function () {
      assert.equal(trimPunctuations("did."), "did.");
    });

    it('word ends with dot and length is more than 6', async function () {
      assert.equal(trimPunctuations("interesting."), "interesting");
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

    it('dash', async function () {
      assert.equal(sameLengthStandardizeCharacters("did\u2013"), "did\u2014");
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


  describe('#removeParentheses()', function () {
    
    it('aurochs', async function () {
      assert.equal(removeParentheses("原牛（现代家牛之祖, 可能于青铜器时代在英国灭绝, 最后一头1627年在波兰被杀）。亦称 URUS."), "原牛。亦称 URUS.");
      assert.equal(removeParentheses("波拿巴(①姓氏, 法国科西嘉岛上的家族 ②Napoleon, 1769-1821, 法国皇帝, 1804-1815在位)"), "波拿巴");
    });

    
  });  
  
});
