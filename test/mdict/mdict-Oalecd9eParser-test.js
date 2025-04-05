
import { strict as assert } from 'assert';
import { Oalecd9eParser } from '../../src/dictionary/mdict/parser/Oalecd9eParser.js'
import fs from 'fs'

describe('mdict oalecd9e parser', function () {
  
  describe('Olaecd9eParser parse', function () {
    before(function() {
      this.parser = new Oalecd9eParser();
    });

    it('good', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "BrE ɡʊd NAmE ɡʊd");
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "高质量");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "令人愉快");      

      assert.equal(parseResult[1].pronunciation, "BrE ɡʊd NAmE ɡʊd");
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "合乎道德");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "益处");      

      assert.equal(parseResult[2].pronunciation, "BrE ɡʊd NAmE ɡʊd");
      assert.equal(parseResult[2].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "好");  

    });

    it('you', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/you.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "BrE ju NAmE jə BrE strong form juː NAmE strong form juː");
      assert.equal(parseResult[0].definitionGroups[0].name, "pronoun");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "你,您,你们");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "");      

    });

    it('-acy', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/-acy.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "");
      assert.equal(parseResult[0].definitionGroups[0].name, "");

    });

    it('rode', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/rode.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "BrE rəʊd,NAmE roʊd");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "past tense of ride");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");

    });

    it('make-oalecd9e', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/make.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "BrE meɪk,NAmE meɪk");
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "制造");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "床");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "使出现／发生／成为／做");

      assert.equal(parseResult[1].pronunciation, "BrE meɪk,NAmE meɪk");
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "品牌，型号");
      
    });

    it('was-oalecd9e link', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/was.html', 'utf8');
      let parseResult = this.parser.parse(html);
      console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].pronunciation, "BrE wəz NAmE wəz BrE strong form wɒz NAmE strong form wʌz");
      assert.equal(parseResult[0].definitionGroups[0].name, "");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "转be");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "be");
      
    });

  });
  
});
