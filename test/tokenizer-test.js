
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

    it('Apostrophe possesion', async function () {
      
      let tokens = tokenize((text)=> {
        //console.log('checkWord:'+text);
        let words = ['he'];
        if(words.includes(text)){
          return text;
        }else {
          return null;
        }
      }, "He's", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "He");
      
      
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
      }, "He'll", 0 , []);
      
      
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "He");
      
      
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


  });

  
  
});
