import { GenericSelectorParser } from './GenericSelectorParser.js'


export class MwalecdParser extends GenericSelectorParser {
    constructor(options){
        super(options);

        let selectors = { };
        selectors[this.ENTRY] = '.entry';
        selectors[this.HEADWORD] = '.hw_d';
        selectors[this.PRONUNCIATION] = '.hpron_word';
        selectors[this.DEFINITION_GROUP] = ['> .sblocks', 'entry/.cxs', 'entry/.dxs'];
        selectors[this.GROUP_NAME] = 'headword/.fl';
        selectors[this.DEFINITION] = ['.sblock :is(.def_text, .un_text, .isyns) .mw_zh', 'entry/.cxs', 'entry/.dxs .dx'];
        
        this.selectors = selectors;
    }

    beforeParseDefinitionElement($, element, context){
        let text = $(element).text();
        let parenthesesText = $(element).find('sup').text();        
        let mainText = text.replace(parenthesesText, '');
        if(this.trimDefinition(mainText).length>0){
            $(element).find('sup').remove();        
        }
       
    }
}
