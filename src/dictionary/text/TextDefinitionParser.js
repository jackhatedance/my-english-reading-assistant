import { DefinitionParser } from '../DefinitionParser.js'
import { splitWordClasses, parseWordClass, splitWordMeanings } from './textDefinitionUtils.js'
import { trimByCharacters } from '../../utils/stringUtils.js'
import { removeParentheses } from '../../text/textUtils.js' 

class TextDefinitionParser extends DefinitionParser {
    parse(rawDefinition) {
        if(!rawDefinition){
            return [];
        }
    
        let entry = this.parseEntry(rawDefinition);    
        let entries = [entry];
        return entries;
    }

    parseEntry(text){
        const phoneticSymbolsArray = text.match(/(\[.*\]|\/.*\/)\s/);
        let pronunciationText = null;
        if(phoneticSymbolsArray && phoneticSymbolsArray.length==2){
            pronunciationText = phoneticSymbolsArray[1];            
        }

        let definitionGroupsText = text;
        if(pronunciationText){
            definitionGroupsText = text.replace(/(\[.*\]|\/.*\/)\s/, '');
        }
        let pronunciation = this.parsePronunciation(pronunciationText);    
        let definitionGroups = this.parseDefinitionGroups(definitionGroupsText);
        return { pronunciation, definitionGroups };
    }

    parsePronunciation(text){   
        if(!text) {
            return '';
        }

        return trimByCharacters(text, '/');
    }

    parseDefinitionGroups(text){
        let definitionGroupTexts = splitWordClasses(text);
    
        let definitionGroups = [];
        for(let definitionGroupText of definitionGroupTexts){
            let definitionGroup = this.parseDefinitionGroup(definitionGroupText);            
            definitionGroups.push(definitionGroup);
        }

        return definitionGroups;
    }

    parseDefinitionGroup(text){
        let wordClassResult = parseWordClass(text);
        let name = wordClassResult.wordClass;    
        name=name.trim();
        let definitionTexts = splitWordMeanings(wordClassResult.meanings);

        let definitions = [];
        for(let definitionText of definitionTexts){
            let definition = this.parseDefinition(definitionText);
            definitions.push(definition);
        }

        let definitionGroup = {name, definitions};
        this.afterParseDefinitionGroup(definitionGroup);
        return definitionGroup;
    }

    parseDefinition(text){        
        if(!text){
            text = '';
        }
        text = this.trimDefinition(text);    

        text = removeParentheses(text);
        text = text.split(',')[0];
        let subdefinitions = [ text ];       
        let definition = { text, subdefinitions };

        this.afterParseDefinition(definition)

        return definition;
    }

}

export { TextDefinitionParser }