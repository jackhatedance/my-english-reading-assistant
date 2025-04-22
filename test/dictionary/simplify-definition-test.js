
import { strict as assert } from 'assert';
import { simplifyDefinition } from '../../src/dictionary/simplify-definition.js'

describe('simplifyDefinition test', function () {

    describe('parse', function () {
        before(function () {

        });

        it('Alice', async function () {
            let lookupResult = {
                "query": "stand",
                "json": [
                    {
                        "headword": {
                            "pronunciations": [{ "region": "", "form": "", "phonetics": "ˈlæd" }]
                        },
                        "definitionGroups": [
                            {
                                "name": "verb",
                                "definitions": [
                                    {
                                        "text": "站,站起来,竖立",
                                        "subdefinitions": ["站", "站起来", "竖立"]
                                    },
                                    {
                                        "text": "竖放,位于,常用作比喻", 
                                        "subdefinitions": ["竖放", "位于", "常用作比喻"]
                                    }
                                ]
                            },
                            {
                                "name": "noun",
                                "definitions": [
                                    {
                                        "text": "立场,通常用单数,抵御",
                                        "subdefinitions": ["立场", "通常用单数", "抵御"]
                                    },
                                    {
                                        "text": "售货亭,架,戏台",
                                        "subdefinitions": ["售货亭", "架", "戏台"]
                                    }
                                ]
                            }

                        ]
                    }
                ],
                "text": "/ˈlæd/\nverb 站,站起来,竖立,竖放,位于,常用作比喻; noun 立场,通常用单数,抵御,售货亭,架,戏台",
                "dictionaryName": "韦氏高阶英汉双解词典"
            };

            let result = simplifyDefinition(lookupResult, null, { maxMeaningNumber: 3, hideWordClass: true });

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, '站,竖放; 立场; ...');

        });



    });

});
