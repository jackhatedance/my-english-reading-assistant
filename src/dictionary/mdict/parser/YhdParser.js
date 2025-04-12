import { GenericSelectorParser } from './GenericSelectorParser.js'


class YhdParser extends GenericSelectorParser {
    constructor(options){
        super(options);

        let selectors = { };
        selectors[this.ENTRY] = '.e';
        selectors[this.HEADWORD] = '.hg';
        selectors[this.PRONUNCIATION] = '.pr';
        selectors[this.DEFINITION_GROUP] = '.sg .se1';
        selectors[this.GROUP_NAME] = '.pos';
        selectors[this.DEFINITION] = '.se2 .df';
        
        this.selectors = selectors;
    }
}

export { YhdParser }