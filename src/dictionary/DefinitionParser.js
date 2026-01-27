import { findBaseForm } from './base-forms.js'
import { findLink } from './links.js'
import { trimByCharacters, isAllUpperCase } from '../utils/stringUtils.js'
import { standardizePunctuations, removeParentheses, splitButIgnoreParentheses } from '../text/textUtils.js'
import { DICTIONARY_DEFINITION_TYPE_FORM, DICTIONARY_DEFINITION_TYPE_LINK, MAX_SUBDEFINITION_NUMBER, PARSER_OPTION_MAX_SUBDEFINITION_NUMBER, PARSER_OPTION_DEDUPLICATE_SUBDEFINITIONS, PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY, ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE } from './dictConstants.js'
import { deduplicateSubdefinitions } from './entry-utils.js'

export const SUBDEFINITION_SEPARATORS_TYPE_FIRST_FOUND = "firstFound";
export const SUBDEFINITION_SEPARATORS_TYPE_STATIC = "static";

class DefinitionParser {
    constructor(name, version, jsonSchemaVersion, options){
        this.name = name;
        this.version = version;
        this.jsonSchemaVersion = jsonSchemaVersion;
        if(!options){
            options = {};
        }
        this.options = options;

        //comma is for Chinese meanings
        this.subdefinitionSeparator = {
            type: SUBDEFINITION_SEPARATORS_TYPE_FIRST_FOUND,
            value: [';', ',', '!']
        };
        
    }

    getMaxSubdefinitionNumber(){
        if(this.options && this.options.hasOwnProperty(PARSER_OPTION_MAX_SUBDEFINITION_NUMBER)){
            return this.options[PARSER_OPTION_MAX_SUBDEFINITION_NUMBER];
        }else{
            return MAX_SUBDEFINITION_NUMBER;
        }
    }

    getAllUpperCaseEntryPolicy(){
        if(this.options && this.options.hasOwnProperty(PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY)){
            return this.options[PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY];
        }else{
            return null;
        }
    }

    parse(query, rawDefinition) {
        throw new Error('not implemented');
    }

    toJson(query, rawDefinition) {
        return this.parse(query, rawDefinition);
    }

    toHtml(rawDefinition, getResource) {
        throw new Error('not implemented');
    }


    beforeParse(query, rawDefinition){
        //subclass can modify rawDefinition here
        return rawDefinition;
    }

    afterParseDefinitionGroup(definitionGroup){
        if(this.options[PARSER_OPTION_DEDUPLICATE_SUBDEFINITIONS] != false){
            deduplicateSubdefinitions(definitionGroup, this.options.generateDefinitionText);
        }        

        const { definitions } = definitionGroup;
        const totalSubdefinitions = definitions.reduce((accumulator, currentValue) => accumulator + currentValue.subdefinitions.length, 0);
        //balance subdefinitions
        
        var subdefinitionCount = 0;
        var i=0;
        const subdefinitionIndexes = new Array(definitions.length).fill(0);
        while(subdefinitionCount < totalSubdefinitions && subdefinitionCount < this.getMaxSubdefinitionNumber()){
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
                if(this.options.generateDefinitionText){
                    definition.text = definition.subdefinitions.join('; ');
                }
            }            
        }
    }

    parseDefinitionText(text){
        if(!text){
            text = '';
        }

        //too long, possibly parsed wrongly
        if(text.length > 200){
            console.log(`definition too long: ${text}`);
        }
        let originalText = text;
        text = this.beforeParseDefinitionText(text);    

        let typedDefinition = this.detectTypedDefinitionOfText(text);
        
        
        let subdefinitions = this.parseSubdefinitions(text);       
        let definition = { subdefinitions: subdefinitions };
        if(this.options.generateDefinitionText){
            definition.text = subdefinitions.join('; ');
        }

        if(typedDefinition){
            this.assginTypedDefinition(definition, typedDefinition);
        }

        return definition;
    }

    parseSubdefinitions(text){

        let noParenthesesText = removeParentheses(text);

        let separator;
        if(this.subdefinitionSeparator.type == SUBDEFINITION_SEPARATORS_TYPE_FIRST_FOUND){
            let separators = this.subdefinitionSeparator.value;

            separator = separators.find(item => noParenthesesText.indexOf(item) >= 0);
            if(!separator){
                separator = ',';
            }
            
            for(let s of separators){
                if(s!=separator){
                    text = text.replaceAll(s, '/');
                }
            }
        }else{
            //static
            separator = this.subdefinitionSeparator.value;
        }
        
        
        let subdefinitions = splitButIgnoreParentheses(text, separator); 
        subdefinitions = subdefinitions.map(item => this.trimSubdefinition(item));         
        return subdefinitions;
    }

    beforeParseDefinitionText(text){
        if(!text){
            text = '';
        }

        text = standardizePunctuations(text);
        text = this.trimDefinition(text);    

        return text;    
    }

    detectTypedDefinitionOfText(text){
        let baseForm = findBaseForm(text);
        if(baseForm){
            const { base, form } = baseForm;

            let definition = {};
            definition.type= DICTIONARY_DEFINITION_TYPE_FORM;
            definition.form= form;
            
            definition.base = base;
            definition.text = text;

            if(base && isAllUpperCase(base)){
                if(this.getAllUpperCaseEntryPolicy() == ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE){
                    let lowerCaseBase = base.toLowerCase();
            
                    definition.base = lowerCaseBase;
                    definition.text = text.replace(base, lowerCaseBase);
                }
            }
            return definition;
        }

        let link = findLink(text);
        if(link){
            
            let definition = {};
            definition.type= DICTIONARY_DEFINITION_TYPE_LINK;
            definition.form= link;
            
            let lowerCaseLink = link.toLowerCase();
            definition.link = lowerCaseLink;

            definition.text = text.replace(link, lowerCaseLink);

            return definition;
        }
    }

    assginTypedDefinition(definition, typedDefinition){
        
        definition.type = typedDefinition.type;
        if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
            definition.base = typedDefinition.base;
            definition.form = typedDefinition.form;
        } else if(definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
            definition.link = typedDefinition.link;
        }
    
    }

    afterParseDefinition(definition){
                                
    }

    afterParseEntry(entry){
                                
    }

    afterParse(entries){
        //subclass can process entries here
    }

    beforeParsePronunciationText(text){
        //manipulate text
        return text;
    }

    parsePronunciationText(text){
        text = this.beforeParsePronunciationText(text);
        text  = text.trim();

        let pattern = `((?<name>[\\w\\s]+)\\s?)?\\/(?<phonetics>[^\\/]+)\\/`;
        let matchResult = text.match(pattern);
        if(matchResult != null){
            let name = matchResult.groups.name;
            let phonetics = matchResult.groups.phonetics;

            if(name == null){
                name = '';
            }

            return { name, phonetics };            
        }else{
            return { name: '', phonetics: text};
        }
    }

    getPronunciationRegion(name){
                
        if(name && name.includes(this.pronunciationRegionMapping.us)){
            return 'us';
        }

        if(name && name.includes(this.pronunciationRegionMapping.uk)){
            return 'uk';
        }

        return '';
    }

    getPronunciationForm(name){
        return '';
    }

    convertPronunciations(pronuciationArray){
        let array = [];
        for(let pronunciation of pronuciationArray){
            let region = this.getPronunciationRegion(pronunciation.name);
            let form = this.getPronunciationForm(pronunciation.name);
            let phonetics = pronunciation.phonetics;
            array.push({
                region, form, phonetics
            });
        }
        return array;
    }

    trimPronounciation(text){
        text = text.replaceAll(/[\/]/g, '');
        text = text.trim();
        return trimByCharacters(text, '/');
    }
    
    trimDefinition(text){
        text = text.trim();
        text = trimByCharacters(text, ':!;,.');    
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