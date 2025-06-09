import { DefinitionParser } from '../DefinitionParser.js'
import { splitIntoDefinitionGroups, parseWordClass, splitWordMeanings } from './textDefinitionUtils.js'
import { trimByCharacters } from '../../utils/stringUtils.js'
import { standardizePunctuations } from '../../text/textUtils.js'

class TextDefinitionParser extends DefinitionParser {
    
    constructor(options){
        super("TextParser", "1.1.0", "1.0.0", options);
    }

    parse(rawDefinition) {
        if(!rawDefinition){
            return [];
        }
    
        let entry = this.parseEntry(rawDefinition);
        this.afterParseEntry(entry);

        let entries = [entry];
        this.afterParse(entries);
        return entries;
    }

    afterParse(entries){
        
    }

    afterParseEntry(entry){
        let phrases = [];

        let groups = entry.definitionGroups;
        let group = groups.find(item => item.name == 'phr.');
        if(group){
            let index = groups.indexOf(group);
            groups.splice(index, 1);
        
            phrases = group.definitions.map(item => item.text);
        }

        entry.phrases = phrases;
    }

    parseEntry(text){
        const phoneticSymbolsArray = text.match(/(\/.*\/)\s/);
        let pronunciationText = null;
        if(phoneticSymbolsArray && phoneticSymbolsArray.length==2){
            pronunciationText = phoneticSymbolsArray[1];            
        }

        let definitionGroupsText = text;
        if(pronunciationText){
            definitionGroupsText = text.replace(/(\/.*\/)\s/, '');
        }
        
        let pronunciations = this.parsePronunciations(pronunciationText); 
        let headword = { pronunciations };   
        
        let definitionGroups = this.parseDefinitionGroups(definitionGroupsText);
        return { headword, definitionGroups };
    }

    parsePronunciations(text){   
        if(!text) {
            return [];
        }

        let region = '';
        let phonetics = trimByCharacters(text, '/');
        return [{ region, phonetics}];
    }

    parseDefinitionGroups(text){
        let definitionGroupTexts = splitIntoDefinitionGroups(text);
    
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

        let definitionGroupText = standardizePunctuations(wordClassResult.meanings);
        let definitionTexts = splitWordMeanings(definitionGroupText);

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
        let definition = this.parseDefinitionText(text);

        this.afterParseDefinition(definition)

        return definition;
    }

}

export { TextDefinitionParser }