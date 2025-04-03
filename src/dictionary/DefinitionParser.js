import { findBaseForm } from './base-forms.js'
import { trimByCharacters } from '../utils/stringUtils.js'
import { DICTIONARY_DEFINITION_TYPE_FORM, MAX_SUBDEFINITION_NUMBER } from './dictConstants.js'
import { removeParentheses } from '../text/textUtils.js'

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

    afterParseDefinitionGroup(definitionGroup){
        const { definitions } = definitionGroup;
        const totalSubdefinitions = definitions.reduce((accumulator, currentValue) => accumulator + currentValue.subdefinitions.length, 0);
        //balance subdefinitions
        
        var subdefinitionCount = 0;
        var i=0;
        const subdefinitionIndexes = new Array(definitions.length).fill(0);
        while(subdefinitionCount < totalSubdefinitions && subdefinitionCount < MAX_SUBDEFINITION_NUMBER){
            let definitionIndex = i % definitions.length;
            const definition = definitions[definitionIndex];

            let subdefinitions = definition.subdefinitions;
            let subdefinitionIndex = subdefinitionIndexes[definitionIndex];
            if(subdefinitionIndex < subdefinitions.length){
                subdefinitionIndexes[definitionIndex] = subdefinitionIndex + 1;
                subdefinitionCount ++;
            }

            i++;
        }

        //truncate
        for(let definitionIndex = 0; definitionIndex< definitions.length; definitionIndex++){
            let definition = definitions[definitionIndex];
            if(definition.subdefinitions.length >0){
                definition.subdefinitions.length = subdefinitionIndexes[definitionIndex];
                definition.text = definition.subdefinitions.join(',');
                delete definition.subdefinitions.index;
            }            
        }
    }

    beforeGetDefinitionText($, element, context){
        //manipulate DOM
    }

    beforeParseDefinition(text){
        if(!text){
            text = '';
        }
        text = this.trimDefinition(text);    

        text = removeParentheses(text);    
        return text;    
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

    trimPronounciation(text){
        text = text.replaceAll(/[\/]/g, '');
        text = text.trim();
        return trimByCharacters(text, '/');
    }

    trimDefinition(text){
        text = text.replaceAll(/[!！;；]/g, ',')        
        return text.trim();
    }

    trimSubdefinition(text){
        if(text){
            return text.trim();
        }else{
            return '';
        }
    }
    
}

export { DefinitionParser }