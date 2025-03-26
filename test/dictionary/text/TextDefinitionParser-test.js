
import { strict as assert } from 'assert';
import { TextDefinitionParser } from '../../../src/dictionary/text/TextDefinitionParser.js'
import fs from 'fs'

describe('TextDefinitionParser test', function () {
  
  describe('parse', function () {
    before(function() {
      this.parser = new TextDefinitionParser();
    });

    it('Alice', async function () {
      let parseResult = this.parser.parse('n. 爱丽丝');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "");
      assert.equal(parseResult[0].definitionGroups[0].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "爱丽丝");      
      
    });

    it('broke', async function () {
      let parseResult = this.parser.parse('break的过去式');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "");
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "break的过去式");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "break");      
      
    });


  });
  
});
