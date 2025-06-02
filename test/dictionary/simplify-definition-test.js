
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

        it('Ignorant', async function () {
            let lookupResult = { "query": "ignorant", "json": 
                    [
                        {
                            "headword":
                        { "pronunciations": 

                                    [{ "region": "", "form": "", "phonetics": "ˈɪgnərənt" }

                                    ]
                            }, "definitionGroups":
                                [
                            { "name": "adjective", "definitions": 
                                            [{ "text": "没有学识的/ 无知的/ 愚昧的/ 未受教育的,不通世故的", "subdefinitions": ["没有学识的/ 无知的/ 愚昧的/ 未受教育的", "不通世故的"] }]
                                    }
                                ]
                        }
                    ],
                "text": "/ˈɪgnərənt/\nadjective 没有学识的/ 无知的/ 愚昧的/ 未受教育的,不通世故的",
                "dictionaryName": "新牛津英汉双解大词典"
            };

            let result = simplifyDefinition(lookupResult, null, { maxMeaningNumber: 3, hideWordClass: true });

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, '没有学识的,不通世故的');

        });

        it('simplify said', async function () {
            let lookupResult = { "query": "said", "json": [{ "headword": { "pronunciations": [{ "region": "", "form": "", "phonetics": "sed" }] }, "definitionGroups": [{ "name": "", "definitions": [{ "text": "past and past participle of say. SAY的过去式和过去分词", "subdefinitions": ["past and past participle of say. SAY的过去式和过去分词"], "type": "form", "base": "say", "form": "past or past participle" }] }, { "name": "adjective", "definitions": [{ "text": "上述的,该(用于法律语言或幽默中)", "subdefinitions": ["上述的", "该(用于法律语言或幽默中)"] }] }] }], "text": "/sed/\n past and past participle of say. SAY的过去式和过去分词; adjective 上述的,该(用于法律语言或幽默中)", "dictionaryName": "新牛津英汉双解大词典" };
            let deepLookupResult = {"lookupResult":{"query":"say","json":[{"headword":{"pronunciations":[{"region":"","form":"","phonetics":"seɪ"}]},"definitionGroups":[{"name":"verb","definitions":[{"text":"说,讲","subdefinitions":["说","讲"]},{"text":"假设,假定","subdefinitions":["假设","假定"]}]},{"name":"exclamation","definitions":[{"text":"<北美/ 非正式>[表示吃惊或吸引注意力]哎呀,喂","subdefinitions":["<北美/ 非正式>[表示吃惊或吸引注意力]哎呀","喂"]}]},{"name":"noun","definitions":[{"text":"发言机会,发言权","subdefinitions":["发言机会","发言权"]}]}]}],"text":"/seɪ/\nverb 说,讲,假设,假定; exclamation <北美/ 非正式>[表示吃惊或吸引注意力]哎呀,喂; noun 发言机会,发言权","dictionaryName":"新牛津英汉双解大词典"},"type":"transform","word":"say"};

            let result = simplifyDefinition(lookupResult, deepLookupResult, { maxMeaningNumber: 3, hideWordClass: true });

            //console.log(parseResult);
            //assert(tokens.length === 2,"test");

            assert.equal(result, 'past and past participle of say. SAY的过去式和过去分词; 上述的,该');

        });


    });

});
