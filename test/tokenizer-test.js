
import { tokenizeSentence } from '../src/text/tokenizer.js';
import { strict as assert } from 'assert';

describe('tokenizer', function () {
  describe('#tokenizeSentence()', function () {
    it('normal sentence', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Hello, world!", false, 0);
      //console.log(tokens);
      //assert(tokens.length === 2,"test");
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "world");
      
      
    });

    it('end of line hyphenation: normal word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Hello, wor-ld", false, 0 , { newLinePositions: [11] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "world");
      
      
    });

    it('wrong hyphenation: unecessary hyphen', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Hello, wor-ld", false, 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['good-bye', 'world'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "good-bye, world!", false, 0, { newLinePositions: [5] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "good-bye");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words with newline hyphen', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['national', 'secu', 'security'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "national-secu-rity", false, 0, { newLinePositions: [14] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "national");
      assert.equal(tokens[1].content, "-");
      assert.equal(tokens[2].checkWordResult.word, "security");
            
    });

    it('end of line hyphenation: compoud word of 3 words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['his', 'son-in-law', 'son', 'in', 'law'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "his son-in-law", false, 0, { newLinePositions: [11] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "his");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "son-in-law");
            
    });

    it('end of line hyphenation: public-in-formation', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['public', 'in', 'formation', 'information'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "public-in-formation", false, 0, { newLinePositions: [10] });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "public");
      assert.equal(tokens[1].content, "-");

      assert.equal(tokens[2].checkWordResult.word, "information");
      assert.equal(tokens[2].originalContent, "in-formation");
            
    });

    it('end of line hyphenation: lo-cal', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['local', 'lo-cal'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "lo-cal", false, 0, { newLinePositions: [3] });
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "local");
            
    });

    it('dot at end of line', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['of.', 'of', 'think'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "think of.", false, 0, { });
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "think");
      assert.equal(tokens[1].content, " ");

      assert.equal(tokens[2].checkWordResult.word, "of");
      assert.equal(tokens[2].originalContent, "of.");
            
    });

    it('dot not at end of line', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['of.', 'of', 'think', 'any'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "think of. any", false, 0, { });
      
      
      assert.equal(tokens.length, 5);
      
      assert.equal(tokens[0].checkWordResult.word, "think");
      assert.equal(tokens[1].content, " ");

      assert.equal(tokens[2].checkWordResult.word, "of.");
      assert.equal(tokens[2].originalContent, "of.");
            
    });

    it('dot at end of line followed by line break', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['of.', 'of', 'think', 'me.', 'me'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, '“You told him that you told me.”\n', false, 0, { });
      
      
      assert.equal(tokens.length, 14);
      

      assert.equal(tokens[12].checkWordResult.word, "me");
      assert.equal(tokens[12].originalContent, 'me.”');
            
    });

    it('camel word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello','world'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "HelloWorld", false, 0);
      
      
      assert.equal(tokens.length, 2);
      
      assert.equal(tokens[0].checkWordResult.word, "hello");
      assert.equal(tokens[1].checkWordResult.word, "world");
      
      
    });

    it('camel word GetID', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['get', 'id'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "GetID,", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult, undefined);
      assert.equal(tokens[0].originalContent, "GetID,");
      
      
      
    });

    it('camel word with punctuation DuPont,', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['pont'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "DuPont,", false, 0);
      
      
      assert.equal(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Du");
      assert.equal(tokens[1].content, "Pont ");
      assert.equal(tokens[1].checkWordResult.word, "pont");
      
    });

    it('camel word in dictionary', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['TikTok', 'Tik', 'Tok'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "TikTok", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "TikTok");
      
      
    });

    it('slash words', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['yes','no'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Yes/No", false, 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "yes");
      assert.equal(tokens[1].content, "/");
      assert.equal(tokens[2].checkWordResult.word, "no");
      
      
    });

    it('end of line hyphenation: normal word with Apostrophe', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['Russia'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Rus-sia's", false, 0, { newLinePositions: [4] });
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "Russia");
      
      
    });
		

    it('Apostrophe possesion', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "he's", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "he");
      
      
    });

    it('Apostrophe will', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "he'll", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "he");
      
      
    });

    it('Spanish word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'Buendía'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "Hello, Buendía.", false, 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "Buendía");
            
    });

    it('Turkish word', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['C¸atal', 'Hu¨yu¨k', 'Çatalhöyük'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "C¸atal Hu¨yu¨k, Çatalhöyük", false, 0);
      
      
      assert.equal(tokens.length, 5);
      
      assert.equal(tokens[0].checkWordResult.word, "C¸atal");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].checkWordResult.word, "Hu¨yu¨k");
      assert.equal(tokens[3].content, " ");
      assert.equal(tokens[4].checkWordResult.word, "Çatalhöyük");
            
    });


    it('CEOs', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['CEO', 'CEOs'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "CEOs", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "CEO");     
            
    });

    it('D.C.', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['D.C.'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "D.C.", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "D.C.");     
            
    });

    it('U.S.-designated', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['U.S.', 'designated'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "U.S.-designated", false, 0);
      
      
      assert.equal(tokens.length, 3);
      
      assert.equal(tokens[0].checkWordResult.word, "U.S.");     
      assert.equal(tokens[1].content, "-");     
      assert.equal(tokens[2].checkWordResult.word, "designated");     
            
    });


    it('start with non-standard quotaion mark', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['the'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, "’The", false, 0);
      
      
      assert.equal(tokens.length, 1);
      
      assert.equal(tokens[0].checkWordResult.word, "the");     
            
    });

    it('unfamiliar word positions boyat', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['boy', 'at'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, 'boyat', false, 0, { newWordPositions:[3]});
      
      
      assert.equal(tokens.length, 2);
      
      assert.equal(tokens[0].checkWordResult.word, 'boy');
      assert.equal(tokens[1].checkWordResult.word, 'at');            
    });

    it('unfamiliar word positions compound', async function () {
      
      let tokens = tokenizeSentence((text)=> {
        //console.log('checkWord:'+text);
        let words = ['spin', 'off'];
        const result = words.find(e => e.toLowerCase() == text.toLowerCase());
        if(result){
          return { word: result };
        }else {
          return null;
        }
      }, 'spin-offs.[7]', false, 0, { newWordPositions:[10]});
      
      
      assert.equal(tokens.length, 4);
      
      assert.equal(tokens[0].checkWordResult.word, 'spin');
      assert.equal(tokens[2].checkWordResult.word, 'off');            
    });

  });

  it('tower end with 2 punctuations', async function () {
    
    let tokens = tokenizeSentence((text)=> {
      //console.log('checkWord:'+text);
      let words = ['tower'];
      const result = words.find(e => e.toLowerCase() == text.toLowerCase());
      if(result){
          return { word: result };
      }else {
        return null;
      }
    }, '“tower.”1', false, 0, { newWordPositions:[8]});
    
    
    assert.equal(tokens.length, 2);
    
    assert.equal(tokens[0].checkWordResult.word, 'tower');
    assert.equal(tokens[1].content, '1');
  });

  it('plural crows end with 2 punctuations', async function () {
    
    let tokens = tokenizeSentence((text)=> {
      //console.log('checkWord:'+text);
      let words = ['crow'];
      const result = words.find(e => e.toLowerCase() == text.toLowerCase());
      if(result){
          return { word: result };
      }else {
        return null;
      }
    }, '“crows.”', false, 0, { newWordPositions:[8]});
    
    
    assert.equal(tokens.length, 1);
    
    assert.equal(tokens[0].checkWordResult.word, 'crow');
    
  });


});
