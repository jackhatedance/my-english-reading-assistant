import { strict as assert } from 'assert';
import { getEnabled } from '../src/switch-mode.js'

describe('switch', function () {
  describe('switch mode', function () {
    it('default on, site default, english', function () {
      assert.equal(getEnabled('on', '', 'en'), true);
    });

    it('default on, site default, chinese', function () {
      assert.equal(getEnabled('on', '', 'cn'), true);
    });

    it('default on, site off, english', function () {
      assert.equal(getEnabled('on', 'off', 'en'), false);
    });

    it('default on, site off, chinese', function () {
      assert.equal(getEnabled('on', 'off', 'cn'), false);
    });

    it('default on, site auto, english', function () {
      assert.equal(getEnabled('on', 'auto', 'en'), true);
    });

    it('default on, site auto, chinese', function () {
      assert.equal(getEnabled('on', 'auto', 'cn'), false);
    });

    //off
    it('default off, site default, english', function () {
      assert.equal(getEnabled('off', '', 'en'), false);
    });

    it('default off, site default, chinese', function () {
      assert.equal(getEnabled('off', '', 'cn'), false);
    });

    it('default off, site off, english', function () {
      assert.equal(getEnabled('off', 'off', 'en'), false);
    });

    it('default off, site off, chinese', function () {
      assert.equal(getEnabled('off', 'off', 'cn'), false);
    });

    it('default off, site auto, english', function () {
      assert.equal(getEnabled('off', 'auto', 'en'), true);
    });

    it('default off, site auto, chinese', function () {
      assert.equal(getEnabled('off', 'auto', 'cn'), false);
    });

    //auto
    it('default auto, site default, english', function () {
      assert.equal(getEnabled('auto', '', 'en'), true);
    });

    it('default auto, site default, chinese', function () {
      assert.equal(getEnabled('auto', '', 'cn'), false);
    });

    it('default auto, site off, english', function () {
      assert.equal(getEnabled('auto', 'off', 'en'), false);
    });

    it('default auto, site off, chinese', function () {
      assert.equal(getEnabled('auto', 'off', 'cn'), false);
    });

    it('default auto, site auto, english', function () {
      assert.equal(getEnabled('auto', 'auto', 'en'), true);
    });

    it('default auto, site auto, chinese', function () {
      assert.equal(getEnabled('auto', 'auto', 'cn'), false);
    });
    
  });
  
});
