
import { strict as assert } from 'assert';
import { splitWordClasses } from '../../../src/dictionary/text/textDefinitionUtils.js'

describe('TextDefinitionUtils test', function () {
  
  describe('parse', function () {
    before(function() {
      
    });

    it('splitWordClasses bombings SysLarge', async function () {
      let parseResult = splitWordClasses('n. [军] 轰炸, [军] 投弹;v. 轰击；引爆炸弹（bomb的ing形式）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "n. [军] 轰炸, [军] 投弹");
      assert.equal(parseResult[1], "v. 轰击；引爆炸弹（bomb的ing形式）");      
      
    });

    it('splitWordClasses no word class brigand', async function () {
      let parseResult = splitWordClasses("n. 土匪, 强盗;[法] 土匪, 盗贼");
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "n. 土匪, 强盗");
      assert.equal(parseResult[1], "[法] 土匪, 盗贼");      
      
    });

    it('vowed multiple wordclass', async function () {
      let parseResult = splitWordClasses('vt.& vi. 起誓, 发誓（vow的过去式与过去分词形式）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 1);
      assert.equal(parseResult[0], "vt.& vi. 起誓, 发誓（vow的过去式与过去分词形式）");
      
      
    });


  });
  
});
