
import { strict as assert } from 'assert';
import { TextDefinitionParser } from '../../src/dictionary/text/TextDefinitionParser.js'
import fs from 'fs'

describe('text definition parser', function () {
  
  describe('TextDefinitionParser parse', function () {
    before(function() {
      this.parser = new TextDefinitionParser();
    });

    it('text tired', async function () {
      let text = 'a. 疲累的, 疲乏的, 厌倦的';
      let parseResult = this.parser.parse(text);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "a.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "疲累的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "疲乏的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "厌倦的");      
    });


  });
  
});
