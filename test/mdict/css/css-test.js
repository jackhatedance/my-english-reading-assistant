
import { strict as assert } from 'assert';
import { replaceFontFaceSrcUrlWithDataUrl, eliminateFontFaces } from '../../../src/dictionary/mdict/css/css.js'

describe('mdict css', function () {
  
  describe('fontface eliminate', function () {
    before(function() {
      
    });

    it('font face url', async function () {
      let css = `@font-face {
    font-family: "Proxima Nova";
    src: url('fonts/ProximaNova-Thin-webfont-v2.woff') format('woff'), 
            url('fonts/ProximaNova-Thin-webfont-v2.ttf') format('truetype');
    font-weight: 100;
}`;

      let css2 = eliminateFontFaces(css);
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(css2, '');      
    });


  });
  describe('fontface path replace', function () {
    before(function() {
      
    });

    it('font face url', async function () {
      let css = `@font-face {
    font-family: "Proxima Nova";
    src: url('fonts/ProximaNova-Thin-webfont-v2.woff') format('woff'), 
            url('fonts/ProximaNova-Thin-webfont-v2.ttf') format('truetype');
    font-weight: 100;
}`;

      let css2 = replaceFontFaceSrcUrlWithDataUrl(css, (key) => '[base64 string here]');
      //console.log(parseResult);
      //assert(tokens.length === 2,"test");
      
      assert.equal(css2, `@font-face {
    font-family: "Proxima Nova";
    src: url('data:font/woff; base64,[base64 string here]') format('woff'), 
            url('data:font/ttf; base64,[base64 string here]') format('truetype');
    font-weight: 100;
}`);
      
    });


  });
});
