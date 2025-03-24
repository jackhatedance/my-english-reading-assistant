
import { strict as assert } from 'assert';
import { parseTextDefinitionV2 } from '../../../src/dictionary/text/textDefinitionUtils.js'
import fs from 'fs'

describe('textDefinitionUtils test', function () {
  
  describe('parseTextDefinitionV2', function () {
    before(function() {
      
    });

    it('Alice', async function () {
      let parseResult = parseTextDefinitionV2('n. 爱丽丝');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "");
      assert.equal(parseResult[0].definitionGroups[0].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "爱丽丝");      
      
    });


  });
  
});
