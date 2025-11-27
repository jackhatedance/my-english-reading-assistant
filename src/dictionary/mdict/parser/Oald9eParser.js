import { JsonSelectorParser } from './JsonSelectorParser.js'
import { SUBDEFINITION_SEPARATORS_TYPE_STATIC } from '../../DefinitionParser.js'

class Oald9eParser extends JsonSelectorParser {
    constructor(options) {
        super('Oald9eParser',"1.0.0", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    testSelector: '.entry .h-g .sn-gs:not(:empty)',
                    selector: '.entry',
                    headword: [
                        {
                            selector: '.top-g',
                            pronunciation: [
                                {
                                    selector: '> .pron-gs.ei-g .pron-g'
                                },
                                {
                                    selector: 'entry/.sn-g .pron-gs.ei-g .pron-g'
                                },
                            ]
                        },
                    ],
                    definitionGroup: [
                        {
                            selector: '.h-g',

                            groupName: {
                                selector: 'headword/.pos',
                            },
                            definition: [
                                {
                                    selector: '> .sn-gs .shcut'
                                },
                                {
                                    selector: '> .sn-gs .sn-g .def'
                                },
                                {
                                    selector: '> .sn-gs .xr-gs'
                                },                                
                                {
                                    selector: '> .sn-gs .use'
                                } 
                            ]
                        },                      
                    ],
                    phrase: [
                        {
                            group: 'phrase',
                            selector: '.pv-gs .pv-g .pv-l',
                        },
                        {
                            group: 'phrase-no-pv-list',
                            selector: '.pv-gs .pv-g .top-container .top-g > .pv',
                        },
                        {
                            group: 'phrase',
                            selector: '.pv-gs .xr-gs .xr-g',
                        },
                        {
                            group: 'idiom',
                            selector: '.idm-gs .idm-g .top-g .idm',
                        }
                    ]
                },
                {
                    selector: '.entry',
                    headword: [
                        {
                            selector: '.top-g',
                            pronunciation: [
                                {
                                    selector: '> .pron-gs.ei-g .pron-g .phon'
                                },
                                {
                                    selector: 'entry/.sn-g .pron-gs.ei-g .pron-g .phon'
                                },
                            ]
                        },
                    ],
                    definitionGroup: [
                        {
                            selector: '.top-g',

                            groupName: {
                                selector: '.pos',
                            },
                            definition: [
                                {
                                    selector: '.shcut'
                                },
                                {
                                    selector: '.sn-g .def'
                                },
                                {
                                    selector: '.xr-gs'
                                },                                
                                {
                                    selector: '.use'
                                } 
                            ]
                        },
                                                
                    ],
                    phrase: [
                        {
                            group: 'phrase',
                            selector: '.pv-gs .xr-gs .xr-g',
                        },
                        {
                            group: 'idiom',
                            selector: '.idm-gs .idm-g .top-g .idm',
                        }
                    ]
                },
                
                
            ]
        };


        this.pronunciationRegionMapping = {
            uk: 'BrE',
            us: 'NAmE',
        };

        //for english definition, remove comma
        this.subdefinitionSeparator = {
            type: SUBDEFINITION_SEPARATORS_TYPE_STATIC,
            value: ';'
        };
        
    }

    beforeParsePronunciationText(text) {
        return text.replaceAll(/[/]{2}/g, '/')
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

export { Oald9eParser }