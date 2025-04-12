
import { strict as assert } from 'assert';
import { YhdParser } from '../../src/dictionary/mdict/parser/YhdParser.js'
import fs from 'fs'

describe('mdict yhd parser', function () {
  
  describe('YhdParser parse', function () {
    before(function() {
      this.parser = new YhdParser();
    });

    it('yhd good', async function () {
      let html = fs.readFileSync('./test/mdict/yhd/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ɡʊd");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "好的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "正当的");      
    });


  });
  
});
