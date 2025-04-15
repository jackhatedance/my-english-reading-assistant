
import { strict as assert } from 'assert';
import { MwalecdParser } from '../../src/dictionary/mdict/parser/MwalecdParser.js'
import fs from 'fs'
import { PARSER_OPTION_MAX_SUBDEFINITION_NUMBER } from '../../src/dictionary/dictConstants.js'

describe('mdict mwalecd parser', function () {
  
  describe('mwalecd parse', function () {
    before(function() {
      let options = {};
      options[PARSER_OPTION_MAX_SUBDEFINITION_NUMBER] = 999;
      this.parser = new MwalecdParser(options);
    });

    it('mwalecd good', async function () {
      let html = fs.readFileSync('./test/mdict/mwalecd/good.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈgʊd");

      assert.equal(parseResult[0].definitionGroups.length, 1);      

      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 38);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "好的,优良的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "良好");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "正确的,适当的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "令人愉快的,令人高兴的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "顺利的,安好的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "适当的,合适的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[6].text, "明智的,合理的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[7].text, "有益的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[8].text, "令人满意的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[9].text, "表示赞赏的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[10].text, "好的");     
      assert.equal(parseResult[0].definitionGroups[0].definitions[11].text, "健康的,健全的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[12].text, "有好处的,优良的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[13].text, "好心的,善良的,正直的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[14].text, "和蔼的,乐于助人的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[15].text, "有时用于正式地提出请求");
      assert.equal(parseResult[0].definitionGroups[0].definitions[16].text, "规矩的,乖的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[17].text, "有能力的,有本事的,熟练的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[18].text, "有时用作戏谑之意");
      assert.equal(parseResult[0].definitionGroups[0].definitions[19].text, "应对自如的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[20].text, "有…意向的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[21].text, "开心的,高兴的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[22].text, "快乐的,平和的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[23].text, "在…时间内有效");
      assert.equal(parseResult[0].definitionGroups[0].definitions[24].text, "未变质");
      assert.equal(parseResult[0].definitionGroups[0].definitions[25].text, "用于good heavens、good God等短语，表示惊讶、生气或者加强语气");
      assert.equal(parseResult[0].definitionGroups[0].definitions[26].text, "好笑的,有趣的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[27].text, "巨大的,大量的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[28].text, "至少,不少于");
      assert.equal(parseResult[0].definitionGroups[0].definitions[29].text, "用于短语a good");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[30].text, "用力的,彻底的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[31].text, "上流社会的,社会地位高的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[32].text, "亲密的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[33].text, "拥护的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[34].text, "虔诚的,忠心的");
      assert.equal(parseResult[0].definitionGroups[0].definitions[35].text, "有效");
      assert.equal(parseResult[0].definitionGroups[0].definitions[36].text, "命中");
      assert.equal(parseResult[0].definitionGroups[0].definitions[37].text, "够了,到此为止了");
      
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");      
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 12); 
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "善,优点");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "对的事情,好的事情");
      assert.equal(parseResult[1].definitionGroups[0].definitions[2].text, "好事");
      assert.equal(parseResult[1].definitionGroups[0].definitions[3].text, "美德,正义");
      assert.equal(parseResult[1].definitionGroups[0].definitions[4].text, "好人,有道德的人");
      assert.equal(parseResult[1].definitionGroups[0].definitions[5].text, "好的一面");
      assert.equal(parseResult[1].definitionGroups[0].definitions[6].text, "有益的事,有利的事");     
      assert.equal(parseResult[1].definitionGroups[0].definitions[7].text, "好结果");     
      assert.equal(parseResult[1].definitionGroups[0].definitions[8].text, "商品,货物");     
      assert.equal(parseResult[1].definitionGroups[0].definitions[9].text, "私人财物");     
      assert.equal(parseResult[1].definitionGroups[0].definitions[10].text, "货物");     
      assert.equal(parseResult[1].definitionGroups[0].definitions[11].text, "用于另一名词前"); 
      
      assert.equal(parseResult[2].definitionGroups[0].name, "adverb");      
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 2); 
      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "彻底地,完全地");      
      assert.equal(parseResult[2].definitionGroups[0].definitions[1].text, "用于long、many等词前，表强调");
      
    });


    it('mwalecd rang', async function () {
      let html = fs.readFileSync('./test/mdict/mwalecd/rang.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);

      assert.equal(parseResult[0].definitionGroups.length, 1);      

      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "past tense of ring");      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "ring");      
    });

    it('mwalecd is', async function () {
      let html = fs.readFileSync('./test/mdict/mwalecd/is.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);

      assert.equal(parseResult[0].definitionGroups.length, 1);      

      assert.equal(parseResult[0].definitionGroups[0].name, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "see be");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "be");      
           
    });

    it('mwalecd what', async function () {
      let html = fs.readFileSync('./test/mdict/mwalecd/what.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 2);

      assert.equal(parseResult[0].definitionGroups.length, 1);      

      assert.equal(parseResult[0].definitionGroups[0].name, "pronoun");      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 13);      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "什么");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[6].text, "…的东西");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[7].text, "和…一样的,…之类");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[8].text, "…之类的某事物");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[9].text, "…的事物,…的事情");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[10].text, "常接动词不定式");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[11].text, "无论什么");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[12].text, "用于提示要说的事情");      
            
      assert.equal(parseResult[1].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 3);      
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "什么");
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "多么的");
      assert.equal(parseResult[1].definitionGroups[0].definitions[2].text, "全部的,所有的");
      
      assert.equal(parseResult[2].definitionGroups[0].name, "adverb");      
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 1);      
      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "在哪一方面,到何种程度");
      
    });

  });
  
});
