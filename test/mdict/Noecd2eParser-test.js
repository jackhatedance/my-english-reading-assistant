
import { strict as assert } from 'assert';
import { Noecd2eParser } from '../../src/dictionary/mdict/parser/Noecd2eParser.js'
import { MDX } from '@jackhatedance/js-mdict'

describe('mdict new-oxford-ec-dual parser', function () {
  
  describe('Noecd2eParser parse', function () {
    before(function() {
      
      this.parser = new Noecd2eParser({
        //allUpperCaseEntryPolicy: 'lowerCase',
        debugPrintSelectorFind: false,
        generateDefinitionText: true,
      });

      this.mdx = new MDX('./test-resource/mdict/mdx/新牛津英汉双解大词典（第2版）.mdx');
      this.lookup = function(word) {
        return this.mdx.lookup(word).definition;
      };

    });

    it('noecd2e good', async function () {
      let html = this.lookup('good');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "gʊd");


      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "合意的, 满意的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "合格的; 胜任的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "善的; 有德行的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "让人高兴的; 令人愉快的; 令人满意的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "彻底的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "天哪!啊呀");      
      
      assert.equal(parseResult[0].definitionGroups[1].name, "noun");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "善; 正义");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[1].text, "好处; 优势");      
      assert.equal(parseResult[0].definitionGroups[1].definitions[2].text, "商品; 所有物");      
      
      assert.equal(parseResult[0].definitionGroups[2].name, "adverb");      
      assert.equal(parseResult[0].definitionGroups[2].definitions[0].text, "<非正式>好地");      
      
      assert.equal(parseResult[0].phrases.length, 28);
      assert.equal(parseResult[0].phrases[0], "all to the good");      
    });

    it('noecd2e phrase good for', async function () {
      let html = this.lookup('good for');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
        
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "对…有好处");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "总能提供的");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "足够支付的");   
    });

    it('noecd2e phrase take after', async function () {
      let html = this.lookup('take after');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
        
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "与(父母, 先辈)相像");
    });

    it('noecd2e draggle', async function () {
      let html = this.lookup('draggle');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈdrægl");

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "拖脏, 拖湿");      
      
    });

    it('noecd2e titter', async function () {
      let html = this.lookup('titter');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈtɪtə(r)");

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "窃笑; 咯咯笑");      
      
    });


    it('noecd2e -et', async function () {
      let html = this.lookup('-et');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ɪt");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "构成原为指小词的名词");      
      
    });

    it('noecd2e feathers link', async function () {
      let html = this.lookup('feathers');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "feather");      
      
    });

    it('noecd2e prentice link uppercase', async function () {
      let html = this.lookup('prentice');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "apprentice");      
      
    });

    it('noecd2e twelve', async function () {
      let html = this.lookup('twelve');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "twelv");

      assert.equal(parseResult[0].definitionGroups[0].name, "cardinal number");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "12十二; 十二个");
      
    });

    it('noecd2e musty', async function () {
      let html = this.lookup('musty');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈmʌstɪ");

      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");      
      assert.equal(parseResult[0].definitionGroups[0].inflection, "mustier, mustiest");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "有霉味的; 有潮气的");      
      
    });

    it('noecd2e these - plual', async function () {
      let html = this.lookup('these');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ðiːz");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "this的复数");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].form, "plural");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "this");            
    });


    it('noecd2e is - third person singular', async function () {
      let html = this.lookup('is');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "强ɪz, 弱z");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "be的第三人称单数现在时");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "form");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].form, "third person singular present");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].base, "be");      
      
      
    });

    it('noecd2e but - parentheses, subdefinitions', async function () {
      let html = this.lookup('but');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "强bʌt, 弱bət");

      assert.equal(parseResult[0].definitionGroups[2].definitions[1].text, "<澳/新西兰, 苏格兰, 非正式>[用于句尾]但是, 然而");
      
      
    });

    it('noecd2e rode - merge pronunciations', async function () {
      let html = this.lookup('rode');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "rəʊd");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "ride的过去式");
      
      
    });

    it('noecd2e zoophyte', async function () {
      let html = this.lookup('zoophyte');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈzəʊəfaɪt");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "[动]<旧>植形动物, 植虫(如珊瑚、海葵、海绵、海百合等)");
      
      
    });

    it('noecd2e Nabokov', async function () {
      let html = this.lookup('Nabokov');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "nəˈbəʊkɒf");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "纳巴科夫, 弗拉基米尔(·弗拉迪莫洛维奇)(1899-1977, 俄国出生的美国诗人和小说家, 以小说《洛莉塔》[1955]最为著名; 该小说讲述了一个中年男人对一个12岁女孩的迷恋)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].subdefinitions[0], "纳巴科夫, 弗拉基米尔(·弗拉迪莫洛维奇)(1899-1977, 俄国出生的美国诗人和小说家, 以小说《洛莉塔》[1955]最为著名; 该小说讲述了一个中年男人对一个12岁女孩的迷恋)");
      
    });

    it('noecd2e said', async function () {
      let html = this.lookup('said');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "sed");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "say的过去式和过去分词");
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "上述的, 该(用于法律语言或幽默中)");
      
    });

    it('noecd2e woven', async function () {
      let html = this.lookup('woven');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, "");
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈwəʊvən");

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "weave的过去分词");
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "编织的; 机织的");
      
    });

    it('noecd2e guts', async function () {
      let html = this.lookup('guts');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "见gut");
      assert.equal(parseResult[0].phrases.length, 0);
      
    });

    it('noecd2e underscore', async function () {
      let html = this.lookup('underscore');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "同UNDERLINE");
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "同UNDERLINE(义项1)");
      assert.equal(parseResult[0].phrases.length, 0);
      
    });

    it('noecd2e could', async function () {
      let html = this.lookup('could');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "can的过去式");
      
    });

    it('noecd2e woke', async function () {
      let html = this.lookup('woke');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "wake的过去式");
      
    });

    it('noecd2e wrap', async function () {
        let html = this.lookup('wrap');
        let parseResult = this.parser.parse(html);
        //console.log(JSON.stringify(parseResult));
        //assert(tokens.length === 2,"test");
  
  
        assert.equal(parseResult[0].phrases.length, 3);
        assert.equal(parseResult[0].phrases[0], "be wrapped up in");
        assert.equal(parseResult[0].phrases[1], "wrap up");
        assert.equal(parseResult[0].phrases[2], "wrap something up");
    });

    it('noecd2e moose', async function () {
        let html = this.lookup('moose');
        let parseResult = this.parser.parse(html);
        //console.log(JSON.stringify(parseResult));
        //assert(tokens.length === 2,"test");
  
  
        assert.equal(parseResult[0].definitionGroups.length, 1);
        assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "<北美>同ELK");
        assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "elk");
        
    });
  });
  
});
