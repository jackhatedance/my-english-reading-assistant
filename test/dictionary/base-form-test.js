
import { strict as assert } from 'assert';
import { findBaseForm } from '../../src/dictionary/base-forms.js'

describe('base-forms test', function () {

    describe('findBaseForm', function () {
        before(function () {

        });

        it('sysLarge was', async function () {
            let result = findBaseForm("be的过去式");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result.base, 'be');

        });

        it('sysLarge goes', async function () {
            let result = findBaseForm("go的第三人称单数形式");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result.base, 'go');

        });

        it('sysLarge habitualness', async function () {
            let result = findBaseForm("habitual(习惯性的)的变形");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result.base, 'habitual');

        });

        it('sysLarge squeezed', async function () {
            let result = findBaseForm("squeeze(挤压)的过去式与过去分词");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result.base, 'squeeze');

        });

        it('sysLarge spin-offs', async function () {
            let result = findBaseForm("spin-off的复数");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result.base, 'spin-off');

        });


    });

});
