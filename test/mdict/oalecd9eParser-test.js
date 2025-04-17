
import { strict as assert } from 'assert';
import { Oalecd9eParser } from '../../src/dictionary/mdict/parser/Oalecd9eParser.js'
import fs from 'fs'

describe('mdict oalecd9e parser', function () {
  
  describe('Olaecd9eParser parse', function () {
    before(function() {
      this.parser = new Oalecd9eParser();
    });

    it('oalecd9e good', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "高质量");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "令人愉快");      

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "合乎道德");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "益处");      

      assert.equal(parseResult[2].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[2].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[2].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[2].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[2].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "好");  

    });

    it('oalecd9e you', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/you.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'ju');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'jə');

      assert.equal(parseResult[0].headword.pronunciations[2].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[2].form, 'strong');
      assert.equal(parseResult[0].headword.pronunciations[2].phonetics, 'juː');

      assert.equal(parseResult[0].headword.pronunciations[3].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[3].form, 'strong');
      assert.equal(parseResult[0].headword.pronunciations[3].phonetics, 'juː');

      assert.equal(parseResult[0].definitionGroups[0].name, "pronoun");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "你,您,你们");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "");      

    });

    it('oalecd9e -acy', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/-acy.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      assert.equal(parseResult[0].definitionGroups[0].name, "");

    });

    it('oalecd9e rode', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/rode.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'rəʊd');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'roʊd');

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "past tense of ride");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "ride");

    });

    it('oalecd9e make', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/make.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'meɪk');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'meɪk');

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "制造");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "床");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "使出现／发生／成为／做");

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'meɪk');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'meɪk');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "品牌，型号");
      
    });

    it('oalecd9e zoom', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/zoom.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "快速移动,迅速前往");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "急剧增长,猛涨");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "拉近，推远,使画面放大（或缩小）");

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "疾驰的声音");
      
    });

    it('oalecd9e was link', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/was.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'wəz');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'wəz');

      assert.equal(parseResult[0].headword.pronunciations[2].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[2].form, 'strong');
      assert.equal(parseResult[0].headword.pronunciations[2].phonetics, 'wɒz');

      assert.equal(parseResult[0].headword.pronunciations[3].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[3].form, 'strong');
      assert.equal(parseResult[0].headword.pronunciations[3].phonetics, 'wʌz');
      
      assert.equal(parseResult[0].definitionGroups[0].name, "");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "➡  be verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "be");
      
    });

  });
  
});
