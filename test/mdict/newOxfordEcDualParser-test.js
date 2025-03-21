
import { strict as assert } from 'assert';
import { NewOxfordEcDualParser } from '../../src/dictionary/mdict/parser/NewOxfordEcDualParser.js'
import fs from 'fs'

describe('mdict new-oxford-ec-dual parser', function () {
  
  describe('NewOxfordEcDualParser parse', function () {
    before(function() {
      this.parser = new NewOxfordEcDualParser();
    });

    it('good', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/gʊd/");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "合意的, 满意的");      
      
    });

    it('draggle', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/draggle.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/ˈdrægl/");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "拖脏, 拖湿");      
      
    });

    it('titter', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/titter.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/ˈtɪtə(r)/");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "窃笑, 咯咯笑");      
      
    });


    it('-et', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/-et.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/ɪt/");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "构成原为指小词的名词");      
      
    });

    it('feathers link', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/feathers.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].type, "link");
      assert.equal(parseResult[0].link, "feather");      
      
    });

    it('twelve', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/twelve.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/twelv/");
      assert.equal(parseResult[0].definitionGroups[0].name, "cardinal number");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "12十二, 十二个");
      
    });

    it('musty', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/musty.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "/ˈmʌstɪ/");
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0], "有霉味的, 有潮气的");      
      
    });

  });
  
});
