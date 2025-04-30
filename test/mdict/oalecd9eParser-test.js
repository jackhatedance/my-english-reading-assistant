
import { strict as assert } from 'assert';
import { Oalecd9eParser } from '../../src/dictionary/mdict/parser/Oalecd9eParser.js'
import fs from 'fs'

describe('mdict oalecd9e parser', function () {
  
  describe('Olaecd9eParser parse', function () {
    before(function() {
      this.parser = new Oalecd9eParser({ debugPrintSelectorFind: false });
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "(与名词及形容词连用,直接称呼某人)");      

    });

    it('oalecd9e rode', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/rode.html', 'utf8');
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
      let html = fs.readFileSync('./test/mdict/oalecd9e/make.html', 'utf8');
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
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(机器、设备等的)品牌,型号");
      
    });

    it('oalecd9e zoom', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/zoom.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "快速移动,迅速前往");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].subdefinitions[0], "快速移动");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].subdefinitions[1], "迅速前往");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "急剧增长,猛涨");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "(用变焦距镜头)拉近/推远,使画面放大(或缩小)");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].subdefinitions[0], "(用变焦距镜头)拉近/推远");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].subdefinitions[1], "使画面放大(或缩小)");

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(车辆等)疾驰的声音");
      
    });

    it('oalecd9e was link', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/was.html', 'utf8');
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
      let html = fs.readFileSync('./test/mdict/oalecd9e/preside.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "prɪˈzaɪd");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "prɪˈzaɪd");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "主持(会议、仪式等),担任(会议)主席");
      
    });

    it('oalecd9e apple', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/apple.html', 'utf8');
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
      let html = fs.readFileSync('./test/mdict/oalecd9e/ad.html', 'utf8');
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
      let html = fs.readFileSync('./test/mdict/oalecd9e/refer.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "rɪˈfɜː(r)");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "rɪˈfɜːr");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 4);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "提到,谈及");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "描述,涉及");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "查阅");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "将…送交给(以求获得帮助等)");
    });

    it('oalecd9e used', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/used.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "juːst");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "juːst");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "习惯于,适应");
    });


    it('oalecd9e tech', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/tech.html', 'utf8');
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "➡  see also high-tech,low-tech");
    });

    it('oalecd9e titty', async function () {
      let html = fs.readFileSync('./test/mdict/oalecd9e/titty.html', 'utf8');
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
      let html = fs.readFileSync('./test/mdict/oalecd9e/-ally.html', 'utf8');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "suffix");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "以 -al 结尾的形容词加 ly 构成副词");
      
    });


    it("oalecd9e 'tis", async function () {
      let html = fs.readFileSync("./test/mdict/oalecd9e/'tis.html", 'utf8');
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
      let html = fs.readFileSync("./test/mdict/oalecd9e/condo.html", 'utf8');
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
      let html = fs.readFileSync("./test/mdict/oalecd9e/covert.html", 'utf8');
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "秘密的,隐蔽的,暗中的");
      
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "(动物可藏身的)矮树丛,灌木林");
      
    });


    it("oalecd9e behold exclude idiom def", async function () {
      let html = fs.readFileSync("./test/mdict/oalecd9e/behold.html", 'utf8');
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "看,看见");
      
    });

  });
  
});
