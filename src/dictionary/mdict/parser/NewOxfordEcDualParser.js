import { GenericSelectorParser } from './GenericSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { DICTIONARY_DEFINITION_TYPE_FORM, DICTIONARY_DEFINITION_TYPE_FORM_PLURAL } from '../../dictConstants.js'

class NewOxfordEcDualParser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = '.ODECN';
        selectors[this.PRONUNCIATION] = '.pron';
        selectors[this.DEFINITION_GROUP] = '.content .cont-list';
        selectors[this.GROUP_NAME] = '.pos';
        selectors[this.INFLECTION] = '.inflection';
        selectors[this.DEFINITION] = ['.item .defs .def', '.defs .def', '.def'];
        
        this.selectors = selectors;
    }

    getLink(html){
        if(html){
            let matchResult = html.trim().match(/^@@@LINK=(\w*)\r*\n*\u0000*$/);
            if(matchResult){
                return matchResult[1];
            }
        }
        return null;    
    }

    parse(rawDefinition) {
        let html = rawDefinition;
        
        let link = this.getLink(html);
        if (link) {
            let linkEntry = this.createEntryForLink(link);
            return [ linkEntry ];
        }

        return super.parse(rawDefinition);
    }

    afterParseDefinitionGroup(definitionGroup){
        const {name, inflection} = definitionGroup;
        if(name.includes(inflection)){
            definitionGroup.name = name.replace(inflection, '');
        }
    }

    afterParseDefinition(definition){
        let text = definition.text;
        let result = text.match('([a-zA-Z]+) ?的复数');
        if(result != null){
            let base = result[1];
            definition.type= DICTIONARY_DEFINITION_TYPE_FORM;
            definition.form=DICTIONARY_DEFINITION_TYPE_FORM_PLURAL;
            
            let lowerCaseBase = base.toLowerCase();
            definition.base=lowerCaseBase;

            definition.text = text.replace(base, lowerCaseBase);
        }
    }

    trimDefinition(text){        
        text = trimByCharacters(text, '：。');
        return super.trimDefinition(text);
    }
}

export { NewOxfordEcDualParser }