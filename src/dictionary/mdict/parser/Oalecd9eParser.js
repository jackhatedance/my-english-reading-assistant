import { JsonSelectorParser } from './JsonSelectorParser.js'


class Oalecd9eParser extends JsonSelectorParser {
    constructor(options) {
        super('Oalecd9eParser',"1.1.0", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    testSelector: '.cixing_part subentry-g',
                    selector: '.cixing_part',
                    headword: [
                        {
                            testSelector: '> top-g pron-g-blk',
                            selector: '> top-g',
                            pronunciation:
                                [
                                    {
                                        selector: 'pron-gs pron-g-blk'
                                    },
                                    {
                                        selector: 'pron pron-g-blk'
                                    },
                                ]
                        },
                        {
                            testSelector: 'subentry-g pron-gs pron-g-blk',
                            selector: 'subentry-g',
                            pronunciation:
                                [
                                    {
                                        selector: 'pron-gs pron-g-blk'
                                    },
                                    {
                                        selector: 'pron pron-g-blk'
                                    },
                                ]
                        },
                    ],
                    definitionGroup: [
                        {
                            selector: 'subentry-g',

                            groupName: {
                                selector: '> top-g pos',
                            },
                            definition:
                                [
                                    {
                                        selector: '> sn-gs shcut-blk chn'
                                    },
                                    {
                                        selector: '> sn-gs sn-blk-nolist sn-g def chn'
                                    },
                                    {
                                        selector: '> sn-gs sn-blk sn-g def chn'
                                    },
                                ]
                        },
                    ],
                    phrase: [
                        {
                            group: 'phrase',
                            selector: 'pv-gs-blk pv-gs pvp-g-blk pvp-g pv-g-blk pv-g top-g pv-blk pv',
                        },
                        {
                            group: 'idiom',
                            selector: 'idm-gs-blk idm-gs idm-g top-g idm-blk idm',
                        }
                    ]
                },
                {
                    testSelector: '.cixing_part h-g',
                    selector: '.cixing_part h-g',
                    headword: {
                        selector: '> top-g',
                        pronunciation:
                            [
                                {
                                    selector: 'pron-gs pron-g-blk'
                                },
                                {
                                    selector: 'pron pron-g-blk'
                                },
                            ]
                    },
                    definitionGroup: [
                        {
                            selector: 'sn-gs',

                            groupName: {
                                selector: 'headword/pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'shcut-blk chn'
                                    },
                                    {
                                        selector: 'sn-blk-nolist sn-g def chn'
                                    },
                                    {
                                        selector: 'sn-blk sn-g def chn'
                                    },
                                ]
                        },
                    ],
                    phrase: [
                        {
                            group: 'phrase',
                            selector: 'pv-gs-blk pv-gs pvp-g-blk pvp-g pv-g-blk pv-g top-g pv-blk pv',
                        },
                        {
                            group: 'idiom',
                            selector: 'idm-gs-blk idm-gs idm-g top-g idm-blk idm',
                        }
                    ]
                },
                {
                    selector: 'h-g',
                    headword: {
                        selector: '> top-g',
                        pronunciation:
                            [
                                {
                                    selector: 'pron-gs pron-g-blk'
                                },
                                {
                                    selector: '>pron>pron-g-blk'
                                },
                            ],
                    },
                    definitionGroup: [
                        {
                            name: 'snblk1',
                            testSelector: '> sn-gs:not(:empty)',
                            selector: '> sn-gs',

                            groupName: {
                                selector: 'headword/pos',
                            },
                            definition:
                                [
                                    {
                                        selector: '>shcut-blk>shcut>chn'
                                    },
                                    {
                                        selector: '>sn-blk>xhtml\\:ol sn-g def chn'
                                    },
                                    {
                                        testSelector: '>sn-blk-nolist>sn-g>def chn:empty',
                                        selector: '>sn-blk-nolist>sn-g>def'
                                    },
                                    {
                                        selector: '>sn-blk-nolist>sn-g>def chn'
                                    },
                                    {
                                        selector: '>sn-blk-nolist>sn-g>use-blk chn'
                                    },
                                    {
                                        selector: '>sn-blk>xhtml\\:ol sn-g>xr-gs'
                                    },
                                    {
                                        selector: '>sn-blk>sn-g>def'
                                    },
                                    {
                                        selector: '>sn-blk-nolist>sn-g>def'
                                    },
                                    {
                                        selector: '>sn-blk-nolist>sn-g>xr-gs'
                                    },
                                    
                                ]
                        },
                        {
                            testSelector: 'headword/xr-gs',
                            selector: 'top-g',

                            groupName: {
                                selector: 'headword/pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'xr-gs'
                                    }                                    
                                ]
                        },
                        {
                            selector: '> pv-gs-blk',

                            groupName: {
                                selector: 'headword/pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'pv-gs pvp-g-blk sn-g def chn'
                                    }                                    
                                ]
                        },

                    ],
                    phrase: [
                        {
                            group: 'phrase',
                            selector: 'pv-gs-blk pv-gs pvp-g-blk pvp-g pv-g-blk pv-g top-g pv-blk pv',
                        },
                        {
                            group: 'idiom',
                            selector: 'idm-gs-blk idm-gs idm-g top-g idm-blk idm',
                        }
                    ]
                },
                {
                    /* phrase */
                    selector: 'idm-g',
                    definitionGroup: [
                        {
                            selector: 'sn-gs',
                            definition:
                                [
                                    {
                                        selector: 'sn-blk sn-g def chn'
                                    },
                                ]
                        },

                    ]
                },
                {
                    /* phrase */
                    selector: 'pv-g',
                    definitionGroup: [
                        {
                            selector: 'sn-gs',
                            definition:
                                [
                                    {
                                        selector: 'sn-blk sn-g def chn'
                                    },
                                ]
                        },

                    ]
                }

            ]
        };


        this.pronunciationRegionMapping = {
            uk: 'BrE',
            us: 'NAmE',
        };
    }

    beforeParsePronunciationText(text) {
        return text.replaceAll(/[🔊]/g, '')
    }

    getPronunciationForm(name) {
        if (name && name.includes('strong')) {
            return 'strong';
        }
        return super.getPronunciationForm(name);
    }

    trimPronounciation(text) {
        return super.trimPronounciation(text);
    }

    beforeParsePhraseText(text){
        let result = super.beforeParseDefinitionText(text);
        result = result.replaceAll(/[ˈˌ]/g, '');
        return result;
    }
}

export { Oalecd9eParser }