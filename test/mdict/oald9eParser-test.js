
import { strict as assert } from 'assert';
import { Oald9eParser } from '../../src/dictionary/mdict/parser/Oald9eParser.js'
import { MDX } from '@jackhatedance/js-mdict'

describe('mdict oalecd9e parser', function () {
  
  describe('Oald9eParser parse', function () {
    before(function() {
      this.parser = new Oald9eParser({ debugPrintSelectorFind: true, generateDefinitionText: true });

      this.mdx = new MDX("./test/mdict/mdx/Oxford Advanced Learner's Dictionary, 9th Ed.mdx");
      this.lookup = function(word) {
        return this.mdx.lookup(word).definition;
      };
    });

    it('oald9e good', async function () {
      let html = this.lookup('good');
      let parseResult = this.parser.parse(html);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "high quality");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "pleasant");      

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "morally right");      
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "something helpful");      

      assert.equal(parseResult[2].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[2].headword.pronunciations[0].phonetics, 'ɡʊd');

      assert.equal(parseResult[2].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[2].headword.pronunciations[1].phonetics, 'ɡʊd');

      assert.equal(parseResult[2].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "well");  

      assert.equal(parseResult[0].phrases.length, 6);
      assert.equal(parseResult[0].phrases[0], "as good as");
      assert.equal(parseResult[0].phrases[5], "good for you, somebody, them, etc");

      assert.equal(parseResult[1].phrases.length, 11);
      assert.equal(parseResult[1].phrases[0], "all to the good");
      assert.equal(parseResult[1].phrases[5], "do somebody a power of good");

      assert.equal(parseResult[2].phrases.length, 0);
      
    });

    it('oald9e you', async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "used as the subject or object of a verb or after a preposition to refer to the person or people being spoken or written to");      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "used with nouns and adjectives to speak to somebody directly");      

    });

    it('oald9e rode', async function () {
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

    it('oald9e make', async function () {
      let html = this.lookup('make');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, 'meɪk');

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, 'meɪk');

      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "create");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "a bed");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "cause to appear/happen/become/do");

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'meɪk');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'meɪk');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "the name or type of a machine, piece of equipment, etc. that is made by a particular company");
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].subdefinitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].subdefinitions[0], "the name or type of a machine, piece of equipment, etc. that is made by a particular company");
      
    });

    it('oald9e zoom', async function () {
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

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "to move or go somewhere very fast");
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "to increase a lot quickly and suddenly");
      
      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, 'zuːm');

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, 'zuːm');

      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "the sound of a vehicle moving very fast");
      
    });

    it('oald9e was link', async function () {
      let html = this.lookup('was');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "见be");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].type, "link");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].link, "be");
      
    });

    it('oald9e preside', async function () {
      let html = this.lookup('preside');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "prɪˈzaɪd");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "prɪˈzaɪd");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "to lead or be in charge of a meeting, ceremony, etc");
      
    });

    it('oald9e apple', async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "a round fruit with shiny red or green skin and firm white flesh");
      
    });

    it('oald9e ad', async function () {
      let html = this.lookup('ad');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "æd");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "æd");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "noun");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 3);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "= advertisement");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "see also banner ad");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].type, 'link');
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "See related entries: Marketing");
      
    });

    it('oald9e refer phraser verbs', async function () {
      let html = this.lookup('refer');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "rɪˈfɜː(r)");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "rɪˈfɜːr");
      
      assert.equal(parseResult[0].phrases.length, 3);
      assert.equal(parseResult[0].phrases[0], "refer to somebody");
      assert.equal(parseResult[0].phrases[1], "refer to somebody");
      assert.equal(parseResult[0].phrases[2], "refer somebody to somebody");
    });

    it('oald9e get', async function () {
      let html = this.lookup('get');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ɡet");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ɡet");
      
      assert.equal(parseResult[0].definitionGroups.length, 1);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "verb");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 21);
      
      
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "receive/obtain");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "bring");
      assert.equal(parseResult[0].definitionGroups[0].definitions[20].text, "confuse/annoy");

      //console.log(JSON.stringify(parseResult[0].phrases));
      assert.equal(parseResult[0].phrases.length, 94);
      assert.equal(parseResult[0].phrases[0], "get about");
      assert.equal(parseResult[0].phrases[1], "get above yourself");
      assert.equal(parseResult[0].phrases[93], "what has got into somebody?");
    });

    it('oald9e phrase wrap up', async function () {
      let html = this.lookup('wrap up');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");

      assert.equal(parseResult[0].definitionGroups.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 0);
      

      assert.equal(parseResult[0].phrases.length, 3);
      assert.equal(parseResult[0].phrases[0], "wrap up | wrap it up");
      assert.equal(parseResult[0].phrases[1], "wrap up | wrap somebody up | wrap yourself up");
      assert.equal(parseResult[0].phrases[2], "wrap somethingup");
    });

    it('oald9e used', async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "familiar with something because you do it or experience it often");
    });


    it('oald9e tech', async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "= technology");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "= technical college");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "see also high-tech, low-tech");
    });

    it('oald9e titty', async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "= tit (1)");
      
    });

    it('oald9e -ally', async function () {
      let html = this.lookup('-ally');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 0);
      
      assert.equal(parseResult[0].definitionGroups[0].name, "suffix");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "(makes adverbs from adjectives that end in -al)");
      
    });


    it("oald9e 'tis", async function () {
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

    it("oald9e condo", async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "= condominium");
      
    });


    it("oald9e covert", async function () {
      let html = this.lookup('covert');
      let parseResult = this.parser.parse(html);
      //console.log(JSON.stringify(parseResult));
      //assert(tokens.length === 2,"test");
      
      assert.equal(parseResult[0].headword.pronunciations.length, 3);

      assert.equal(parseResult[0].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[0].phonetics, "ˈkʌvət");

      assert.equal(parseResult[0].headword.pronunciations[1].region, 'uk');
      assert.equal(parseResult[0].headword.pronunciations[1].phonetics, "ˈkəʊvɜːt");
      
      assert.equal(parseResult[0].headword.pronunciations[2].region, 'us');
      assert.equal(parseResult[0].headword.pronunciations[2].phonetics, "ˈkoʊvɜːrt");
      
      assert.equal(parseResult[0].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "secret or hidden, making it difficult to notice");
      
      assert.equal(parseResult[1].definitionGroups[0].name, "noun");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);
      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "an area of thick low bushes and trees where animals can hide");
      
    });


    it("oald9e behold exclude idiom def", async function () {
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
      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "to look at or see somebody/something");
      
    });


    it("oald9e the", async function () {
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

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "used to refer to somebody/something that has already been mentioned or is easily understood");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "used to refer to somebody/something that is the only, normal or obvious one of their kind");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "used when explaining which person or thing you mean");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "used to refer to a thing in general rather than a particular example");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "used with adjectives to refer to a thing or a group of people described by the adjective");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "used before the plural of somebody’s last name to refer to a whole family or a married couple");
      assert.equal(parseResult[0].definitionGroups[0].definitions[6].text, "enough of something for a particular purpose");
      assert.equal(parseResult[0].definitionGroups[0].definitions[7].text, "used with a unit of measurement to mean ‘every’");
      assert.equal(parseResult[0].definitionGroups[0].definitions[8].text, "used with a unit of time to mean ‘the present’");
      assert.equal(parseResult[0].definitionGroups[0].definitions[9].text, "used, stressing the, to show that the person or thing referred to is famous or important");

      
    });



    it("oald9e least", async function () {
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

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "smallest in size, amount, degree, etc");
      

      assert.equal(parseResult[1].headword.pronunciations.length, 2);

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, "liːst");

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, "liːst");
      

      assert.equal(parseResult[1].definitionGroups[0].name, "adverb");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 1);

      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "to the smallest degree");
      
    });


    it("oald9e well", async function () {
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

      assert.equal(parseResult[0].definitionGroups[0].definitions[0].text, "in a good, right or acceptable way");
      assert.equal(parseResult[0].definitionGroups[0].definitions[1].text, "thoroughly and completely");
      assert.equal(parseResult[0].definitionGroups[0].definitions[2].text, "to a great extent or degree");
      assert.equal(parseResult[0].definitionGroups[0].definitions[3].text, "easily");
      assert.equal(parseResult[0].definitionGroups[0].definitions[4].text, "probably");
      assert.equal(parseResult[0].definitionGroups[0].definitions[5].text, "with good reason");
      

      assert.equal(parseResult[1].headword.pronunciations.length, 2);

      assert.equal(parseResult[1].headword.pronunciations[0].region, 'uk');
      assert.equal(parseResult[1].headword.pronunciations[0].phonetics, "wel");

      assert.equal(parseResult[1].headword.pronunciations[1].region, 'us');
      assert.equal(parseResult[1].headword.pronunciations[1].phonetics, "wel");
      

      assert.equal(parseResult[1].definitionGroups[0].name, "adjective");
      assert.equal(parseResult[1].definitionGroups[0].definitions.length, 3);

      assert.equal(parseResult[1].definitionGroups[0].definitions[0].text, "in good health");
      assert.equal(parseResult[1].definitionGroups[0].definitions[1].text, "in a good state or position");
      assert.equal(parseResult[1].definitionGroups[0].definitions[2].text, "sensible; a good idea");
      

      assert.equal(parseResult[2].definitionGroups[0].name, "exclamation");
      assert.equal(parseResult[2].definitionGroups[0].definitions.length, 9);

      assert.equal(parseResult[2].definitionGroups[0].definitions[0].text, "used to express surprise, anger or relief");
      assert.equal(parseResult[2].definitionGroups[0].definitions[1].text, "used to show that you accept that something cannot be changed");
      assert.equal(parseResult[2].definitionGroups[0].definitions[2].text, "used to agree to something, rather unwillingly");
      assert.equal(parseResult[2].definitionGroups[0].definitions[3].text, "used when continuing a conversation after a pause");
      assert.equal(parseResult[2].definitionGroups[0].definitions[4].text, "used to say that something is uncertain");
      assert.equal(parseResult[2].definitionGroups[0].definitions[5].text, "used to show that you are waiting for somebody to say something");
      assert.equal(parseResult[2].definitionGroups[0].definitions[6].text, "used to mark the end of a conversation");
      assert.equal(parseResult[2].definitionGroups[0].definitions[7].text, "used when you are pausing to consider your next words");
      assert.equal(parseResult[2].definitionGroups[0].definitions[8].text, "used when you want to correct or change something that you have just said");
      

      assert.equal(parseResult[3].definitionGroups[0].name, "noun");
      assert.equal(parseResult[3].definitionGroups[0].definitions.length, 3);

      assert.equal(parseResult[3].definitionGroups[0].definitions[0].text, "a deep hole in the ground from which people obtain water. The sides of wells are usually covered with brick or stone and there is usually some covering or a small wall at the top of the well");
      assert.equal(parseResult[3].definitionGroups[0].definitions[1].text, "a narrow space in a building that drops down from a high to a low level and usually contains stairs or a lift/elevator");
      assert.equal(parseResult[3].definitionGroups[0].definitions[2].text, "the space in front of the judge in a court, where the lawyers sit");
      


      assert.equal(parseResult[4].definitionGroups[0].name, "verb");
      assert.equal(parseResult[4].definitionGroups[0].definitions.length, 2);

      assert.equal(parseResult[4].definitionGroups[0].definitions[0].text, "to rise to the surface of something and start to flow");
      assert.equal(parseResult[4].definitionGroups[0].definitions[1].text, "to become stronger");
      
      
    });

  });
  
});
