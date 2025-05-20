
import { strict as assert } from 'assert';
import { YhdParser } from '../../src/dictionary/mdict/parser/YhdParser.js'
import { MDX } from '@jackhatedance/js-mdict'

describe('mdict yhd parser', function () {
  
  describe('YhdParser parse', function () {
    before(function() {
      this.parser = new YhdParser();

      this.mdx = new MDX('./test/mdict/mdx/英汉大词典（第2版）.mdx');
      this.lookup = function(word) {
        return this.mdx.lookup(word).definition;
      };
    });

    it('yhd good', async function () {
      let html = this.lookup('good');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ɡʊd");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "好的,出色的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "正当的,正确的");      
    });

    it('yhd zoot', async function () {
      let html = this.lookup('zoot');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "zuːt");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "= zoot suit");
      
    });

    it('yhd varech', async function () {
      let html = this.lookup('varech');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "n.");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "[植]海草,海藻");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "海草灰");
      
      
    });


  });
  
});
