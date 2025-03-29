
import { strict as assert } from 'assert';
import { compareMap } from '../../src/dictionary/mdict/mdictProfileRegister.js'

describe('mdict new-oxford-ec-dual parser', function () {
  
  describe('NewOxfordEcDualParser parse', function () {
    before(function() {
      
    });

    it('compareMap same case', async function () {
        let map1 = {"FooBar": 1};
        let map2 = {"FooBar": 1};
        
        let result = compareMap(map1, map2);
        assert.equal(result, true);
              
    });

    it('compareMap different case', async function () {
        let map1 = {"FooBar": 1};
        let map2 = {"Foobar": 1};
        
        let result = compareMap(map1, map2);
        assert.equal(result, true);
      
    });

    it('compareMap different key', async function () {
        let map1 = {"FooBar": 1};
        let map2 = {"Foobar2": 1};
        
        let result = compareMap(map1, map2);
        assert.equal(result, false);
      
    });

  });
  
});
