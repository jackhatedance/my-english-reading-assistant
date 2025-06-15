
import { strict as assert } from 'assert';
import { splitIntoDefinitionGroups } from '../../../src/dictionary/text/textDefinitionUtils.js'

describe('TextDefinitionUtils test', function () {
  
  describe('parse', function () {
    before(function() {
      
    });

    it('splitIntoDefinitionGroups bombings SysLarge', async function () {
      let parseResult = splitIntoDefinitionGroups('n. [军] 轰炸, [军] 投弹;v. 轰击；引爆炸弹（bomb的ing形式）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "n. [军] 轰炸, [军] 投弹");
      assert.equal(parseResult[1], "v. 轰击；引爆炸弹（bomb的ing形式）");      
      
    });

    it('splitIntoDefinitionGroups no word class brigand', async function () {
      let parseResult = splitIntoDefinitionGroups("n. 土匪, 强盗;[法] 土匪, 盗贼");
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "n. 土匪, 强盗");
      assert.equal(parseResult[1], "[法] 土匪, 盗贼");      
      
    });

    it('splitIntoDefinitionGroups vowed multiple wordclass', async function () {
      let parseResult = splitIntoDefinitionGroups('vt.& vi. 起誓, 发誓（vow的过去式与过去分词形式）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 1);
      assert.equal(parseResult[0], "vt.& vi. 起誓, 发誓（vow的过去式与过去分词形式）");
      
      
    });

    it('splitIntoDefinitionGroups squeezed', async function () {
      let parseResult = splitIntoDefinitionGroups('squeeze（挤压）的过去式与过去分词');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult.length, 1);
      assert.equal(parseResult[0], "squeeze（挤压）的过去式与过去分词");
      
      
    });

    it('splitIntoDefinitionGroups will sysSmall', async function () {
      let parseResult = splitIntoDefinitionGroups("n. 意志, 决心, 意愿, 意向, 干劲, 遗嘱; vt. 用意志的力量驱使, 决意, 愿意, 立遗嘱; vi. 下决心, 愿意; aux. 将, 愿意, 必须");
      
      assert.equal(parseResult.length, 4);
      assert.equal(parseResult[0], "n. 意志, 决心, 意愿, 意向, 干劲, 遗嘱");
      assert.equal(parseResult[1], "vt. 用意志的力量驱使, 决意, 愿意, 立遗嘱");
      assert.equal(parseResult[2], "vi. 下决心, 愿意");
      assert.equal(parseResult[3], "aux. 将, 愿意, 必须");
    });

    it("splitIntoDefinitionGroups here's sysLarge", async function () {
      let parseResult = splitIntoDefinitionGroups("abbr. (=here is. Here's to you)! 干杯;[网络] 这里有；这里是；用");
      
      assert.equal(parseResult.length, 2);
      assert.equal(parseResult[0], "abbr. (=here is. Here's to you)! 干杯");
      assert.equal(parseResult[1], "[网络] 这里有；这里是；用");
    });


  });
  
});
