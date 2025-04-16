import { JsonSelectorParser } from './JsonSelectorParser.js'


class YhdParser extends JsonSelectorParser {
    constructor(options) {
        super(options);

        let selectors = {};
        selectors[this.ENTRY] = '.e';
        selectors[this.HEADWORD] = '.hg';
        selectors[this.PRONUNCIATION] = '.pr';
        selectors[this.DEFINITION_GROUP] = '.sg .se1';
        selectors[this.GROUP_NAME] = '.pos';
        selectors[this.DEFINITION] = '.se2 .df';

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
                        definition:
                        {
                            selector: '.se2 .df'
                        },
                    },
                },
            ]
        };
    }
}

export { YhdParser }