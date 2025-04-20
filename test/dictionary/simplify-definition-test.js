
import { strict as assert } from 'assert';
import { simplifyDefinition } from '../../src/dictionary/simplify-definition.js'

describe('TextDefinitionParser test', function () {

    describe('parse', function () {
        before(function () {

        });

        it('Alice', async function () {
            let lookupResult = { "query": "lad", "json": [{ "headword": { "pronunciations": [{ "region": "", "form": "", "phonetics": "ˈlæd" }] }, "definitionGroups": [{ "name": "noun", "definitions": [{ "text": "男孩子,男青年,小伙子", "subdefinitions": ["男孩子", "男青年", "小伙子"] }, { "text": "伙计,伙伴,哥们儿", "subdefinitions": ["伙计", "伙伴", "哥们儿"] }] }] }], "text": "/ˈlæd/\nnoun 男孩子,男青年,小伙子,伙计,伙伴,哥们儿", "dictionaryName": "韦氏高阶英汉双解词典" };

            let result = simplifyDefinition(lookupResult, null, {maxMeaningNumber:3, hideWordClass:true});

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, '男孩子,伙计,男青年; ...');
            
        });



    });

});
