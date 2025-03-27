import { findBaseForm } from './base-forms.js'
import { DICTIONARY_DEFINITION_TYPE_FORM } from './dictConstants.js'

class DefinitionParser {
    parse(rawDefinition) {
        throw new Error('not implemented');
    }

    toJson(rawDefinition) {
        return this.parse(rawDefinition);
    }

    toHtml(rawDefinition, getResource) {
        throw new Error('not implemented');
    }


    beforeParse(rawDefinition){
        //subclass can modify rawDefinition here
        return rawDefinition;
    }

    afterParseDefinitionGroup(){

    }

    afterParseDefinition(definition){
        let text = definition.text;

        let baseForm = findBaseForm(text);
        if(baseForm){
            const { base, form } = baseForm;
            definition.type= DICTIONARY_DEFINITION_TYPE_FORM;
            definition.form= form;
            
            let lowerCaseBase = base.toLowerCase();
            definition.base=lowerCaseBase;

            definition.text = text.replace(base, lowerCaseBase);
        }                
    }

    afterParse(entries){
        //subclass can process entries here
    }

    trimDefinition(text){
        return text.trim();
    }
    
}

export { DefinitionParser }