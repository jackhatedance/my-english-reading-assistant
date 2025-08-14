import { strict as assert } from 'assert';
import { getWordClassAbbreviation } from '../../src/dictionary/wordClass.js'

describe('word class test', function () {

    describe('word class', function () {
        before(function () {

        });

        it('word class contraction', async function () {
            let result = getWordClassAbbreviation("contraction");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, 'cont.');

        });



    });

});
