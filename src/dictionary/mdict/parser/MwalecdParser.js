import { GenericSelectorParser } from './GenericSelectorParser.js'


export class MwalecdParser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = '.entry';
        selectors[this.HEADWORD] = '.hw_d';
        selectors[this.PRONUNCIATION] = '.hpron_word';
        selectors[this.DEFINITION_GROUP] = '.sblocks';
        selectors[this.GROUP_NAME] = 'headword:.fl';
        selectors[this.DEFINITION] = '.sblock .def_text .mw_zh';
        
        this.selectors = selectors;
    }
}
