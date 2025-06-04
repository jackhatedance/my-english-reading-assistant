import { JsonSelectorParser } from './JsonSelectorParser.js'


export class MwalecdParser extends JsonSelectorParser {
    constructor(options) {
        super('MwalecdParser', "1.1.0", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.entry',
                    headword: {
                        selector: '.hw_d',
                        pronunciation: {
                            selector: '.hpron_word'
                        },
                    },
                    definitionGroup: [
                        {
                            selector: '> .sblocks',

                            groupName: {
                                selector: 'headword/.fl',
                            },
                            definition: 
                            [
                                {
                                    selector: '.sblock :is(.def_text, .un_text, .isyns) .mw_zh'
                                },
                                {
                                    selector: '.sblock :is(.def_text, .un_text, .isyns)'
                                },
                                {
                                    selector: '.sblock .dxs .dx'
                                },                                
                                {
                                    selector: '.sblock .both_text .mw_zh'
                                },
                                {
                                    selector: '.sblock .both_text'
                                },
                            ]
                        },
                        {
                            selector: '.cxs',  
                            virtual: true,        
                            definition: [
                                {
                                    selector: '.cxs',
                                    removeSelector: 'sup',
                                },                                
                            ]                        
                        },
                        {
                            selector: '.dxs',          
                            definition: [
                                {
                                    selector: '.dx',
                                },                                
                            ]                        
                        },
                        {
                            selector: '.dros',

                            groupName: {
                                selector: 'headword/.fl',
                            },
                            definition: 
                            [
                                {
                                    selector: '.sblock :is(.def_text, .both_text, .un_text, .isyns) .mw_zh'
                                },   
                                {
                                    selector: '.sblock :is(.def_text, .both_text, .un_text, .isyns)'
                                },                                
                            ]
                        },
                    ],
                    phrase: [
                        {
                            selector: '.dros .dro .dro_line .dre'
                        }
                    ]
                },
                {
                    selector: '.sms',
                    virtual: true,
                    
                    definitionGroup: [
                        {
                            selector: '.dro',  
                            virtual: true,
                            groupName: [
                                {
                                    selector: '.dro_line .sl',
                                },
                                {
                                    selector: '.dro_line .gram_internal',
                                },
                            ],        
                            definition: [
                                {
                                    selector: '.sblocks .sblock.sblock_dro .sblock_c .scnt .sense .def_text .mw_zh',
                                },                                
                            ]                        
                        },
                        {
                            group: 'main-entry',
                            selector: '.sms',  
                            virtual: true,        
                            definition: [
                                {
                                    selector: '.sms',
                                },                                
                            ]                        
                        },                        
                    ]
                },
                
            ]
        };

    }

}
