import { GenericSelectorParser } from './GenericSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { findBaseForm } from '../../base-forms.js' 

class NewOxfordEcDualParser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = '.ODECN';
        selectors[this.PRONUNCIATION] = '.pron';
        selectors[this.DEFINITION_GROUP] = '.content .cont-list';
        selectors[this.GROUP_NAME] = '.pos';
        selectors[this.INFLECTION] = '.inflection';
        selectors[this.DEFINITION] = ['.item .defs>dl .def', '.defs>dl .def', '.def'];
        
        this.selectors = selectors;
    }

    beforeGetDefinitionText($, element, context){
        let text = $(element).text();
        let parenthesesText = $(element).find('strong').text();        
        let mainText = text.replace(parenthesesText, '');
        if(this.trimDefinition(mainText).length>0){
            $(element).find('strong').remove();        
        }
    }
    
    beforeParseDefinition(text){
        
        let baseForm = findBaseForm(text);
        if(baseForm){
            const { base, form } = baseForm;            
            let lowerCaseBase = base.toLowerCase();
        
            text = text.replace(base, lowerCaseBase);
        }   

        return super.beforeParseDefinition(text);        
    }

    afterParseDefinitionGroup(definitionGroup){
        const {name, inflection} = definitionGroup;
        if(name.includes(inflection)){
            definitionGroup.name = name.replace(inflection, '');
        }
        super.afterParseDefinitionGroup(definitionGroup);
    }

    trimDefinition(text){        
        text = trimByCharacters(text, '：。');
        return super.trimDefinition(text);
    }
}

export { NewOxfordEcDualParser }