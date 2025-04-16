import { JsonSelectorParser } from './JsonSelectorParser.js'


export class MwalecdParser extends JsonSelectorParser {
    constructor(options) {
        super(options);

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
                    ]
                },
                {
                    selector: '.sms',
                    virtual: true,
                    headword: {                        
                        selector: '.uro .ure',
                    },
                    definitionGroup: [
                        {
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

    beforeParseDefinitionElement($, element, context) {
        let text = $(element).text();
        let parenthesesText = $(element).find('sup').text();
        let mainText = text.replace(parenthesesText, '');
        if (this.trimDefinition(mainText).length > 0) {
            $(element).find('sup').remove();
        }

    }
}
