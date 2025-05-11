import { JsonSelectorParser } from './JsonSelectorParser.js'


class YhdParser extends JsonSelectorParser {
    constructor(options) {
        super('YhdParser', "1.0.2", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.e',
                    headword: {
                        selector: '.hg',
                        pronunciation: {
                            selector: '.pr'
                        },
                    },
                    definitionGroup: {
                        selector: '.sg .se1',

                        groupName: {
                            selector: '.pos',
                        },
                        definition:[
                            {
                                selector: '.se2 .df'
                            },
                            {
                                selector: '.se2 .xrg'
                            },
                        ]
                        
                    },
                },
                {
                    selector: '.table',
                    virtual: true,                    
                    definitionGroup: {
                        selector: '.table',
                        virtual: true,
                        groupName: {      
                            selector: '.tag3',                      
                        },
                        definition:[
                            {
                                selector: '.table',
                                removeSelector: '.num',

                            },                            
                        ]
                        
                    },
                },
            ]
        };
    }
}

export { YhdParser }