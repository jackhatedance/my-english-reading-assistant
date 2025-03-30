import { GenericSelectorParser } from './GenericSelectorParser.js'


class Oald9Parser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = '.entry';
        selectors[this.PRONUNCIATION] = '.hg .pr';
        selectors[this.DEFINITION_GROUP] = '.sg .se1';
        selectors[this.GROUP_NAME] = '.pos';
        selectors[this.DEFINITION] = '.se2 .df';
        
        this.selectors = selectors;
    }
}

export { Oald9Parser }