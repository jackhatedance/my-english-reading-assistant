
import {tokenize} from '../src/text/tokenizer.js';
import { strict as assert } from 'assert';

describe('tokenizer', function () {
  describe('#tokenize()', function () {
    it('normal sentence', async function () {
      
      let tokens = tokenize((text)=> {return null;}, "Hello, world!", 0 , []);
      console.log(tokens);
      //assert(tokens.length === 2,"test");
      assert(tokens.length, 2);
      
      assert.equal(tokens[0].content, "Hello,");
      assert.equal(tokens[1].content, " ");
      assert.equal(tokens[2].content, "world!");
      
      
    });
  });
  
});
