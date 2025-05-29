
import { tokenizeSentence } from '../src/text/tokenizer.js';
import { strict as assert } from 'assert';

describe('tokenizer', function () {
  describe('#tokenizeSentence()', function () {
    it('normal sentence', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, world!", 0);
      //console.log(tokens);
      //assert(tokens.length === 2,"test");
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: normal word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, wor-ld", 0 , { newLinePositions: [11] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('wrong hyphenation: unecessary hyphen', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, wor-ld", 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['good-bye', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "good-bye, world!", 0 , { newLinePositions: [5] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "good-bye");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words with newline hyphen', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['national', 'secu', 'security'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "national-secu-rity", 0 , { newLinePositions: [14] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "national");
      assert.equal(tokens[1].content, "-");
      assert.equal(tokens[2].content, "security");
            
    });

    it('end of line hyphenation: compoud word of 3 words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['his', 'son-in-law', 'son', 'in', 'law'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "his son-in-law", 0 , { newLinePositions: [11] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "his");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "son-in-law");
            
    });

    it('end of line hyphenation: public-in-formation', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['public', 'in', 'formation', 'information'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "public-in-formation", 0 , { newLinePositions: [10] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "public");
      assert.equal(tokens[1].content, "-");

      assert.equal(tokens[2].content, "information");
      assert.equal(tokens[2].originalContent, "in-formation");
            
    });

    it('dot at end of line', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['of.', 'of', 'think'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "think of.", 0 , { });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "think");
      assert.equal(tokens[1].content, " ");

      assert.equal(tokens[2].content, "of");
      assert.equal(tokens[2].originalContent, "of.");
            
    });

    it('dot not at end of line', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['of.', 'of', 'think', 'any'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "think of. any", 0 , { });
      
      
      assert.equal(tokens.length, 5);
      
      assert.equal(tokens[0].content, "think");
      assert.equal(tokens[1].content, " ");

      assert.equal(tokens[2].content, "of.");
      assert.equal(tokens[2].originalContent, "of.");
            
    });

    it('camel word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['Hello','World'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "HelloWorld", 0);
      
      
      assert.equal(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, "World");
      
      
    });

    it('camel word in dictionary', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['TikTok', 'Tik', 'Tok'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "TikTok", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "TikTok");
      
      
    });

    it('slash words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['yes','no'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Yes/No", 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "Yes");
      assert.equal(tokens[1].content, "/");
      assert.equal(tokens[2].content, "No");
      
      
    });

    it('end of line hyphenation: normal word with Apostrophe', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['Russia'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Rus-sia's", 0 , { newLinePositions: [4] });
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "Russia");
      
      
    });
		

    it('Apostrophe possesion', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "he's", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "he");
      
      
    });

    it('Apostrophe will', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "he'll", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "he");
      
      
    });

    it('Spanish word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'Buendía'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, Buendía.", 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "Buendía");
            
    });

    it('Turkish word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['C¸atal', 'Hu¨yu¨k', 'Çatalhöyük'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "C¸atal Hu¨yu¨k, Çatalhöyük", 0);
      
      
      assert.equal(tokens.length, 5);
      
      assert.equal(tokens[0].content, "C¸atal");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "Hu¨yu¨k");
      assert.equal(tokens[3].content, " ");
      assert.equal(tokens[4].content, "Çatalhöyük");
            
    });


    it('CEOs', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['CEO', 'CEOs'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "CEOs", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "CEO");     
            
    });

    it('D.C.', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['D.C.'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "D.C.", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "D.C.");     
            
    });

    it('U.S.-designated', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['U.S.', 'designated'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "U.S.-designated", 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].content, "U.S.");     
      assert.equal(tokens[1].content, "-");     
      assert.equal(tokens[2].content, "designated");     
            
    });


    it('start with non-standard quotaion mark', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['the'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "’The", 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].content, "The");     
            
    });

    it('new word positions', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['boy', 'at'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, 'boyat', 0, { newWordPositions:[3]});
      
      
      assert.equal(tokens.length, 2);
      
      assert.equal(tokens[0].content, 'boy');
      assert.equal(tokens[1].content, 'at');            
    });

  });

  it('tower end with 2 punctuations', async function () {
    
    let tokens = tokenizeSentence((text)=> {
      //console.log('checkWord:'+text);
      let words = ['tower'];
      if(words.includes(text)){
        return text;
      }else {
        return null;
      }
    }, '“tower.”1', 0, { newWordPositions:[8]});
    
    
    assert.equal(tokens.length, 2);
    
    assert.equal(tokens[0].content, 'tower');
    assert.equal(tokens[1].content, '1');
  });


});
