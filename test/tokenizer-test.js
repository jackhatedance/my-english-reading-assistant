
import {tokenize} from '../src/text/tokenizer.js';
import { strict as assert } from 'assert';

describe('tokenizer', function () {
  describe('#tokenize()', function () {
    it('normal sentence', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, world!", 0 , []);
      //console.log(tokens);
      //assert(tokens.length === 2,"test");
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: normal word', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, wor-ld", 0 , [11]);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('wrong hyphenation: unecessary hyphen', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, wor-ld", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['good-bye', 'world'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "good-bye, world!", 0 , [5]);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "good-bye");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world");
      
      
    });

    it('end of line hyphenation: compoud word of 2 words with newline hyphen', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['national', 'secu', 'security'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "national-secu-rity", 0 , [14]);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "national");
      assert.equal(tokens[1].content, "-");
      assert.equal(tokens[2].content, "security");
            
    });

    it('end of line hyphenation: compoud word of 3 words', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['his', 'son-in-law'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "his son-in-law", 0 , [11]);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "his");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "son-in-law");
            
    });

    it('camel word', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['Hello','World'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "HelloWorld", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, "World");
      
      
    });

    it('slash words', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['yes','no'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Yes/No", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Yes");
      assert.equal(tokens[1].content, "/");
      assert.equal(tokens[2].content, "No");
      
      
    });

    it('end of line hyphenation: normal word with Apostrophe', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['Russia'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Rus-sia's", 0 , [4]);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Russia");
      
      
    });
		

    it('Apostrophe possesion', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "he's", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "he");
      
      
    });

    it('Apostrophe will', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "he'll", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "he");
      
      
    });

    it('Spanish word', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['hello', 'Buendía'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "Hello, Buendía.", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "Buendía");
            
    });

    it('Turkish word', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['C¸atal', 'Hu¨yu¨k', 'Çatalhöyük'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "C¸atal Hu¨yu¨k, Çatalhöyük", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "C¸atal");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "Hu¨yu¨k");
      assert.equal(tokens[3].content, " ");
      assert.equal(tokens[4].content, "Çatalhöyük");
            
    });


    it('CEOs', async function () {
      
      let tokens = tokenize((text)=> {
        console.log('checkWord:'+text);
        let words = ['CEO'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "CEOs", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "CEO");     
            
    });


  });

  
  
});
