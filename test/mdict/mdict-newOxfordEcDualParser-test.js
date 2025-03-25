
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
      
      assert.equal(parseResult[0].pronunciation, "gʊd");
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "合意的");      
      
    });

    it('draggle', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/draggle.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "ˈdrægl");
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "拖脏");      
      
    });

    it('titter', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/titter.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "ˈtɪtə(r)");
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "窃笑");      
      
    });


    it('-et', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/-et.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "ɪt");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "构成原为指小词的名词");      
      
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
      
      assert.equal(parseResult[0].pronunciation, "twelv");
      assert.equal(parseResult[0].definitionGroups[0].name, "cardinal number");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "12十二");
      
    });

    it('musty', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/musty.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "ˈmʌstɪ");
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].inflection, "mustier, mustiest");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "有霉味的");      
      
    });

    it('these - plual', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/these.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "ðiːz");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "this的复数");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].form, "plural");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "this");      
      
      
    });

    it('but - parentheses, subdefinitions', async function () {
      let html = fs.readFileSync('./test/mdict/newOxfordEnglishChinese/but.html', 'utf8');

      let parseResult = this.parser.parse(html);
      console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "强bʌt, 弱bət");
      assert.equal(parseResult[0].definitionGroups[2].definitions[1].text, "但是");
      
      
    });
  });
  
});
