
import { strict as assert } from 'assert';
import { findLink } from '../../src/dictionary/links.js'

describe('link test', function () {

    describe('findLink', function () {
        before(function () {

        });

        it('sysLarge callused', async function () {
            let result = findLink("= calloused");

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, 'calloused');

        });



    });

});
