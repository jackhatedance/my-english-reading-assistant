
import { strict as assert } from 'assert';
import { Oalecd9eParser } from '../../src/dictionary/mdict/parser/Oalecd9eParser.js'
import { MDX } from '@jackhatedance/js-mdict'

describe('mdict oalecd9e parser', function () {
  
  describe('Olaecd9eParser parse', function () {
    before(function() {
      this.parser = new Oalecd9eParser({ debugPrintSelectorFind: false, generateDefinitionText : true });

      this.mdx = new MDX('./test/mdict/mdx/牛津高阶英汉双解词典（第9版）.mdx');
      this.lookup = function(word) {
        return this.mdx.lookup(word).definition;
      };
    });

    it('oalecd9e good', async function () {
      let html = this.lookup('good');
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

      assert.equal(parseResult[0].phrases.length, 6);
      assert.equal(parseResult[0].phrases[0], "as good as");
      assert.equal(parseResult[0].phrases[5], "good for you, sb, them, etc");

      assert.equal(parseResult[1].phrases.length, 11);
      assert.equal(parseResult[1].phrases[0], "all to the good");
      assert.equal(parseResult[1].phrases[5], "for good");

      assert.equal(parseResult[2].phrases.length, 0);
      
    });

    it('oalecd9e phrase do good', async function () {
      let html = this.lookup('do good');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "(对某人)有好处; 有用处; 有益");      
      
    });

    it('oalecd9e you', async function () {
      let html = this.lookup('you');
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "你; 您; 你们");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "(与名词及形容词连用,直接称呼某人)");      

    });

    it('oalecd9e rode', async function () {
      let html = this.lookup('rode');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
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
      let html = this.lookup('make');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
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
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(机器、设备等的)品牌; 型号");
      
    });

    it('oalecd9e zoom', async function () {
      let html = this.lookup('zoom');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 2);

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "快速移动; 迅速前往");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].subdefinitions[0], "快速移动");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].subdefinitions[1], "迅速前往");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "急剧增长; 猛涨");
      
      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(车辆等)疾驰的声音");
      
    });

    it('oalecd9e was link', async function () {
      let html = this.lookup('was');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
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

    it('oalecd9e preside', async function () {
      let html = this.lookup('preside');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "prɪˈzaɪd");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "prɪˈzaɪd");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "主持(会议、仪式等); 担任(会议)主席");
      
    });

    it('oalecd9e apple', async function () {
      let html = this.lookup('apple');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈæpl");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ˈæpl");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "苹果");
      
    });

    it('oalecd9e ad', async function () {
      let html = this.lookup('ad');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "æd");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "æd");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 2);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "=  advertisement");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "➡  see also banner ad");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].type, 'link');
      
    });

    it('oalecd9e refer phraser verbs', async function () {
      let html = this.lookup('refer');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "rɪˈfɜː(r)");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "rɪˈfɜːr");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 4);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "提到; 谈及; 说起");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "描述; 涉及; 与…相关");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "查阅; 参考; 征询");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "将…送交给(以求获得帮助等)");
    });

    it('oalecd9e get', async function () {
      let html = this.lookup('get');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ɡet");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ɡet");
      
      assert.equal(parseResult[0].definitionGroups.length, 21);

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "接到; 得到");
      
      assert.equal(parseResult[0].definitionGroups[1].name, "verb");
      assert.equal(parseResult[0].definitionGroups[1].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[1].definitions[0].text, "带来");

      assert.equal(parseResult[0].definitionGroups[20].name, "verb");
      assert.equal(parseResult[0].definitionGroups[20].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[20].definitions[0].text, "使困惑／烦恼");

      //console.log(JSON.stringify(parseResult[0].phrases));
      assert.equal(parseResult[0].phrases.length, 105);
      assert.equal(parseResult[0].phrases[0], "get about");
      assert.equal(parseResult[0].phrases[1], "get above yourself");
      assert.equal(parseResult[0].phrases[104], "what has got into sb?");
    });

    it('oalecd9e phrase wrap up', async function () {
      let html = this.lookup('wrap up');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");

      assert.equal(parseResult[0].definitionGroups.length, 1);

      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "(使)穿得暖和");
      
    });

    it('oalecd9e used', async function () {
      let html = this.lookup('used');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "juːst");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "juːst");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "习惯于; 适应");
    });


    it('oalecd9e tech', async function () {
      let html = this.lookup('tech');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "tek");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "tek");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 3);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "=  technology");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "=  technical college");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "➡  see also high-tech; low-tech");
    });

    it('oalecd9e titty', async function () {
      let html = this.lookup('titty');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈtɪti");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ˈtɪti");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "=  tit (1)");
      
    });

    it('oalecd9e -ally', async function () {
      let html = this.lookup('-ally');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "suffix");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "以 -al 结尾的形容词加 ly 构成副词");
      
    });


    it("oalecd9e 'tis", async function () {
      let html = this.lookup("'tis");
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "tɪz");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "tɪz");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "short form");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "it is");
      
    });

    it("oalecd9e condo", async function () {
      let html = this.lookup('condo');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈkɒndəʊ");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ˈkɑːndoʊ");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "=  condominium");
      
    });


    it("oalecd9e covert", async function () {
      let html = this.lookup('covert');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 3);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈkʌvət");

      assert.equal(parseResult[0].headword.pronunciations[1].region, '');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ˈkəʊvɜːt");
      
      assert.equal(parseResult[0].headword.pronunciations[2].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[2].phonetics, "ˈkoʊvɜːrt");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "秘密的; 隐蔽的; 暗中的");
      
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(动物可藏身的)矮树丛; 灌木林");
      
    });


    it("oalecd9e behold exclude idiom def", async function () {
      let html = this.lookup('behold');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 2);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "bɪˈhəʊld");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "bɪˈhoʊld");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "看; 看见");
      
    });


    it("oalecd9e the", async function () {
      let html = this.lookup('the');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 6);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ðə");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ðə");
      

      assert.equal(parseResult[0].headword.pronunciations[2].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[2].phonetics, "ði");

      assert.equal(parseResult[0].headword.pronunciations[3].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[3].phonetics, "ði");
      

      assert.equal(parseResult[0].headword.pronunciations[4].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[4].phonetics, "ðiː");

      assert.equal(parseResult[0].headword.pronunciations[5].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[5].phonetics, "ðiː");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "definite article");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 10);

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "(指已提到或易领会到的人或事物)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "(指独一无二的、正常的或不言而喻的人或事物)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "(解说时用)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "(用以泛指)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "(与形容词连用,指事物或统称的人)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "(用于姓氏的复数形式前,指家庭或夫妇)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[6].text, "(指特定用途的事物)足够; 恰好");
      assert.equal(parseResult[0].definitionGroups[0].definitions[7].text, "(与计量单位连用)每; 一");
      assert.equal(parseResult[0].definitionGroups[0].definitions[8].text, "(与时间单位连用)当前的; 本; 此");
      assert.equal(parseResult[0].definitionGroups[0].definitions[9].text, "(重读,表示所指的为知名或重要的人或事物)");

      
    });



    it("oalecd9e least", async function () {
      let html = this.lookup('least');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      assert.equal(parseResult.length, 2);


      assert.equal(parseResult[0].headword.pronunciations.length, 2);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "liːst");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "liːst");
      

      assert.equal(parseResult[0].definitionGroups[0].name, "determiner");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "最小的; 最少的; 程度最轻的");
      

      assert.equal(parseResult[1].headword.pronunciations.length, 2);

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, "liːst");

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, "liːst");
      

      assert.equal(parseResult[1].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);

      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "最小; 最少; 微不足道");
      
    });


    it("oalecd9e well", async function () {
      let html = this.lookup('well');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      assert.equal(parseResult.length, 5);


      assert.equal(parseResult[0].headword.pronunciations.length, 2);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "wel");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "wel");
      

      assert.equal(parseResult[0].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 6);

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "好; 对; 令人满意地");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "完全地; 彻底地; 全部地");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "很; 相当; 大大地; 远远地");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "容易地; 轻松地");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "很可能");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "有充分理由; 合理地");
      

      assert.equal(parseResult[1].headword.pronunciations.length, 2);

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, "wel");

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, "wel");
      

      assert.equal(parseResult[1].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 3);

      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "健康; 身体好");
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "状态良好; 情况良好");
      assert.equal(parseResult[1].definitionGroups[0].definitions[2].text, "明智; 可取; 好主意");
      

      assert.equal(parseResult[2].definitionGroups[0].name, "exclamation");
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 9);

      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "(表示惊奇、愤怒或宽慰)哎呀; 哟; 啊; 好啦");
      assert.equal(parseResult[2].definitionGroups[0].definitions[1].text, "(承认某事不可改变)唉; 好吧");
      assert.equal(parseResult[2].definitionGroups[0].definitions[2].text, "(勉强同意)嗯");
      assert.equal(parseResult[2].definitionGroups[0].definitions[3].text, "(停顿后继续交谈)唔; 这个; 噢");
      assert.equal(parseResult[2].definitionGroups[0].definitions[4].text, "(表示不肯定)哦");
      assert.equal(parseResult[2].definitionGroups[0].definitions[5].text, "(等待别人说话)嘿; 嗨");
      assert.equal(parseResult[2].definitionGroups[0].definitions[6].text, "(结束交谈)就这样");
      assert.equal(parseResult[2].definitionGroups[0].definitions[7].text, "(说话时稍微停顿)对了");
      assert.equal(parseResult[2].definitionGroups[0].definitions[8].text, "(纠正或改变刚说过的话时用)");
      

      assert.equal(parseResult[3].definitionGroups[0].name, "noun");
      assert.equal(parseResult[3].definitionGroups[0].definitions.length, 3);

      assert.equal(parseResult[3].definitionGroups[0].definitions[0].text, "井; 水井");
      assert.equal(parseResult[3].definitionGroups[0].definitions[1].text, "楼梯井; 电梯井道");
      assert.equal(parseResult[3].definitionGroups[0].definitions[2].text, "(法庭中的)律师席");
      


      assert.equal(parseResult[4].definitionGroups[0].name, "verb");
      assert.equal(parseResult[4].definitionGroups[0].definitions.length, 2);

      assert.equal(parseResult[4].definitionGroups[0].definitions[0].text, "涌出; 冒出; 流出; 溢出");
      assert.equal(parseResult[4].definitionGroups[0].definitions[1].text, "涌起; 迸发");
      
      
    });

  });
  
});
