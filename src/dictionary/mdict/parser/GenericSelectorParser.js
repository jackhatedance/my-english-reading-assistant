import { MdictParser } from '../MdictParser.js'
import * as cheerio from 'cheerio';
import { trimByCharacters } from '../../../utils/stringUtils.js'

class GenericSelectorParser extends MdictParser {
    ENTRY = 'entry';
    PRONUNCIATION = 'pronunciation';
    DEFINITION_GROUP = 'definitionGroup';
    GROUP_NAME = 'groupName';
    DEFINITION = 'definition';
    

    selector(name){
        return this.selectors[name];
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
        
        let definitions = [];

        let definitionElements = $(element).find(this.selector(this.DEFINITION));
        for(let definitionElement of definitionElements){
            let definition = $(definitionElement).text();
            definition = definition.replaceAll(/[;]/g, ',')
            definition = definition.trim();
            definitions.push(definition);
        }
        return {name, definitions};
    }

    parse(rawDefinition) {
        let html = rawDefinition;

        const $ = cheerio.load(html);
        return this.parseEntries($);
    }
}

export { GenericSelectorParser }