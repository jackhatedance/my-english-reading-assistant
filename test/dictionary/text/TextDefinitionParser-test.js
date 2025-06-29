
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
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      assert.equal(parseResult[0].definitionGroups[0].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "爱丽丝");      
      
    });

    it('text broke', async function () {
      let parseResult = this.parser.parse('break的过去式');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "break的过去式");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "break");      
    
    });

    it('text spaniards', async function () {
      let parseResult = this.parser.parse("/ˈspænjədz/ Spaniard的复数");
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "Spaniard的复数");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "Spaniard");      
    
    });

    it('text boys SysLarge', async function () {
      let parseResult = this.parser.parse('n. 男孩子们；小伙子们（boy的复数）');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      assert.equal(parseResult[0].definitionGroups[0].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "男孩子们");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "小伙子们(boy的复数)");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].base, "boy");      
      
    });
    
    it('text esquires SysLarge', async function () {
      let parseResult = this.parser.parse('(esquire 的复数) n. 先生, 绅士');
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "(esquire 的复数)");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "esquire");      
      
    });

    it('text Bonaparte', async function () {
      let parseResult = this.parser.parse("/'bәunәpɑ:t/ 波拿巴(①姓氏, 法国科西嘉岛上的家族 ②Napoleon, 1769-1821, 法国皇帝, 1804-1815在位)");
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 1);
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "'bәunәpɑ:t");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "波拿巴(①姓氏, 法国科西嘉岛上的家族 ②Napoleon, 1769-1821, 法国皇帝, 1804-1815在位)");      
      
    });

    it('text Bonaparte bracket2', async function () {
      let parseResult = this.parser.parse("['bәunәpɑ:t] 波拿巴(①姓氏, 法国科西嘉岛上的家族 ②Napoleon, 1769-1821, 法国皇帝, 1804-1815在位)");
      
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "['bәunәpɑ:t] 波拿巴(①姓氏, 法国科西嘉岛上的家族 ②Napoleon, 1769-1821, 法国皇帝, 1804-1815在位)");      
      
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

    it('text tok', async function () {
      let text = 'abbr. 知识转让（Transfer of Knowledge）；知识理论（Theory of Knowledge）;n. (Tok)人名；(阿拉伯)图克；(土)托克；(东南亚国家华语)卓';
      let parseResult = this.parser.parse(text);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "abbr.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "知识转让(Transfer of Knowledge)");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "知识理论(Theory of Knowledge)");      
      
      assert.equal(parseResult[0].definitionGroups[1].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "(Tok)人名");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[1].text, "(阿拉伯)图克");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[2].text, "(土)托克");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[3].text, "(东南亚国家华语)卓");      
            
    });

    it('text give phrases', async function () {
      let text = 'n. 弹性, 适应性; vt. 给, 授予, 供给, 产生, 发表, 付出, 献出, 让出; vi. 捐赠, 支持不住, 让步; phr. give in, give up';
      let parseResult = this.parser.parse(text);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups.length, 3);

      assert.equal(parseResult[0].definitionGroups[0].name, "n.");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "弹性");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "适应性");      
      
      assert.equal(parseResult[0].definitionGroups[1].name, "vt.");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "给");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[1].text, "授予");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[2].text, "供给");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[3].text, "产生");
      
      assert.equal(parseResult[0].definitionGroups[2].name, "vi.");      
      assert.equal(parseResult[0].definitionGroups[2].definitions[0].text, "捐赠");      
      
      assert.equal(parseResult[0].phrases[0], "give in");
      assert.equal(parseResult[0].phrases[1], "give up");
            
    });

  });
  
});
