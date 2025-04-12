
import { strict as assert } from 'assert';
import { MwalecdParser } from '../../src/dictionary/mdict/parser/MwalecdParser.js'
import fs from 'fs'

describe('mdict mwalecd parser', function () {
  
  describe('mwalecd parse', function () {
    before(function() {
      this.parser = new MwalecdParser();
    });

    it('mwalecd good', async function () {
      let html = fs.readFileSync('./test/mdict/mwalecd/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈgʊd");

      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "好的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "良好");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "正确的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "令人愉快的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "顺利的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "适当的");     

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "善");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "对的事情");
      assert.equal(parseResult[1].definitionGroups[0].definitions[2].text, "好事");
      assert.equal(parseResult[1].definitionGroups[0].definitions[3].text, "美德");
      assert.equal(parseResult[1].definitionGroups[0].definitions[4].text, "好人");
      assert.equal(parseResult[1].definitionGroups[0].definitions[5].text, "好的一面");     
    });


  });
  
});
