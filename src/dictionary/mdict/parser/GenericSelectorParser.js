import { MdictParser } from '../MdictParser.js'
import * as cheerio from 'cheerio';
import { trimByCharacters } from '../../../utils/stringUtils.js'

class GenericSelectorParser extends MdictParser {
    ENTRY = 'entry';
    PRONUNCIATION = 'pronunciation';
    DEFINITION_GROUP = 'definitionGroup';
    GROUP_NAME = 'groupName';
    INFLECTION = "inflection";
    DEFINITION = 'definition';
    

    selector(name){
        return this.selectors[name];
    }

    find($, element, selectors){
        if(typeof selectors === 'string'){
            return selectors;
        }

        return selectors.find(selector => $(element).find(selector).length>0);        
    }
        
    parseEntries($){
        let entries = [];

        let entryElements = $(this.selector(this.ENTRY));
        for(let entryElement of entryElements){
            let entry = this.parseEntry($, entryElement);
            entries.push(entry);
        }
        return entries;        
    }

    parseEntry($, element){
        let pronunciation = this.parsePronunciation($, element);    
        let definitionGroups = this.parseDefinitionGroups($, element);
        return { pronunciation, definitionGroups };
    }

    parsePronunciation($, element){
        let pronunciation = $(element).find(this.selector(this.PRONUNCIATION)).text();
        return trimByCharacters(pronunciation, '/');
    }

    parseDefinitionGroups($, element){
        let definitionGroups = [];

        let groupElements = $(element).find(this.selector(this.DEFINITION_GROUP));
        for(let groupElement of groupElements){
            let definitionGroup = this.parseDefinitionGroup($, groupElement);
            definitionGroups.push(definitionGroup);
        }

        return definitionGroups;
    }

    parseDefinitionGroup($, element){
        let name = $(element).find(this.selector(this.GROUP_NAME)).text();
        name=name.trim();
        let inflection = $(element).find(this.selector(this.INFLECTION)).text();

        let definitions = [];

        let selector = this.find($, element, this.selector(this.DEFINITION))
        let definitionElements = $(element).find(selector);
        for(let definitionElement of definitionElements){
            let definition = $(definitionElement).text();
            if(!definition){
                definition = '';
            }
            definition = this.trimDefinition(definition);            
            definitions.push(definition);
        }
        let definitionGroup = {name, inflection, definitions};
        this.afterParseDefinitionGroup(definitionGroup);
        return definitionGroup;
    }
    
    afterParseDefinitionGroup(){

    }

    beforeParse(rawDefinition){
        //subclass can modify rawDefinition here
        return rawDefinition;
    }

    parse(rawDefinition) {
        rawDefinition = this.beforeParse(rawDefinition);

        let html = rawDefinition;

        const $ = cheerio.load(html);
        let entries = this.parseEntries($);

        this.afterParse(entries);

        return entries; 
    }

    afterParse(entries){
        //subclass can process entries here
    }

    trimDefinition(text){
        text = text.replaceAll(/[;]/g, ',')
        return text.trim();
    }
}

export { GenericSelectorParser }