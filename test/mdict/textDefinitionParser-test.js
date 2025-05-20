
import { strict as assert } from 'assert';
import { TextDefinitionParser } from '../../src/dictionary/text/TextDefinitionParser.js'

describe('text definition parser', function () {
  
  describe('TextDefinitionParser parse', function () {
    before(function() {
      this.parser = new TextDefinitionParser();
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


  });
  
});
