import { JsonSelectorParser } from './JsonSelectorParser.js'


class Oald9Parser extends JsonSelectorParser {
    constructor(options){
        super('Oald9Parser', "1.0.0", "1.0.0", options);
        
        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.entry',
                    headword: {
                        selector: '.hg',
                        pronunciation: {
                            selector: '.pr'
                        },
                    },
                    definitionGroup: [
                        {
                            selector: '.sg se1',

                            groupName: {
                                selector: '.pos',
                            },
                            definition: {
                                selector: '.se2 .df'
                            }
                        },                        
                    ]
                },
                
            ]
        };
    }
}

export { Oald9Parser }