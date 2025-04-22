
import { strict as assert } from 'assert';
import { splitWordClasses } from '../../../src/dictionary/text/textDefinitionUtils.js'

describe('TextDefinitionUtils test', function () {
  
  describe('parse', function () {
    before(function() {
      
    });

    it('splitWordClasses', async function () {
      let parseResult = splitWordClasses('n. [军] 轰炸, [军] 投弹;v. 轰击；引爆炸弹（bomb的ing形式）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "n. [军] 轰炸, [军] 投弹");
      assert.equal(parseResult[1], "v. 轰击；引爆炸弹（bomb的ing形式）");      
      
      
    });


  });
  
});
