import { MdictDefinitionParser } from '../MdictDefinitionParser.js'
import * as cheerio from 'cheerio';

class GenericSelectorParser extends MdictDefinitionParser {
    ROOT = 'root';
    ENTRY = 'entry';
    HEADWORD = 'headword';
    PRONUNCIATION = 'pronunciation';
    PRONUNCIATION_NAME = 'pronunciationName';
    PRONUNCIATION_PHONETICS = 'pronunciationPhonetics';
    DEFINITION_GROUP = 'definitionGroup';
    GROUP_NAME = 'groupName';
    INFLECTION = "inflection";
    DEFINITION = 'definition';
    

    selector(name){
        return this.selectors[name];
    }

    hasSelector(name){
        return this.selector(name) != null;
    }
    
    findElementsByOneSelector($, baseElement, selector, context){        
        if(selector.includes(':')){
            let array = selector.split(':');
            let elementName = array[0];
            selector = array[1];

            baseElement = context[elementName];                        
        }

        if(baseElement){
            return $(baseElement).find(selector);        
        }else{
            return $(selector);        
        }
    }

    findElements($, containerElement, selectors, context){        
        let selectorArray;
        if(Array.isArray(selectors)){
            selectorArray = selectors;            
        } else {
            selectorArray = [ selectors ];
        }

        let elements;
        for(let selector of selectorArray){
            elements = this.findElementsByOneSelector($, containerElement, selector, context);
            if(elements.length>0){
                return elements;
            }
        }        

        return elements;
    }
        
    parseEntries($, context){
        let entries = [];

        let entryElements = this.findElements($, null, this.selector(this.ENTRY), context);
        for(let entryElement of entryElements){            
            let entry = this.parseEntry($, entryElement, context);
            entries.push(entry);
        }
        return entries;        
    }

    parseEntry($, element, context){
        context[this.ENTRY] = element;

        let headWordElements = this.findElements($, element, this.selector(this.HEADWORD), context);
        let headWordElement = headWordElements[0];
        let headword = this.parseHeadword($, headWordElement, context);
        
        let definitionGroups = this.parseDefinitionGroups($, element, context);
        
        return { headword, definitionGroups };
    }

    parseHeadword($, element, context){
        context[this.HEADWORD] = element;

        let pronunciations = this.parsePronunciations($, element, context);    
        pronunciations = this.convertPronunciations(pronunciations);
        
        return { pronunciations };
    }
    
    parsePronunciations($, element, context){
        let pronunciationElements = this.findElements($, element, this.selector(this.PRONUNCIATION), context);
        
        let pronunciations = [];
        
        for(let pronunciationElement of pronunciationElements){
            let pronunciation = this.parsePronunciation($, pronunciationElement, context);
           
            pronunciations.push(pronunciation);
        }
        
        return pronunciations;
    }

    parsePronunciation($, element, context){
        this.beforeParsePronunciation($, element, context);

        let pronunciation;
        if(this.hasSelector(this.PRONUNCIATION_NAME) && this.hasSelector(this.PRONUNCIATION_PHONETICS)){
            let name = parserPronunciationName($, element, context);
            let phonetics = parserPronunciationPhonetics($, element, context);
            pronunciation = {name, phonetics};
        }else{
            let pronunciationText = $(element).text();
            pronunciation = this.parsePronunciationText(pronunciationText);
        }
        return pronunciation;    
    }

    beforeParsePronunciation($, element, context){
        //manipulate DOM
    }

    parserPronunciationName($, element, context){
        if(this.hasSelector(this.PRONUNCIATION_NAME)){
            return this.findElements($, element, this.selector(this.PRONUNCIATION_NAME), context).text();
        } else {
            return '';
        }
    }

    parserPronunciationPhonetics($, element, context){
        if(this.hasSelector(this.PRONUNCIATION_PHONETICSNAME)){
            return this.findElements($, element, this.selector(this.PRONUNCIATION_PHONETICS), context).text();
        } else {
            return '';
        }
    }

    parseDefinitionGroups($, element, context){
        let definitionGroups = [];

        let groupElements = this.findElements($, element, this.selector(this.DEFINITION_GROUP), context);
        for(let groupElement of groupElements){
            let definitionGroup = this.parseDefinitionGroup($, groupElement, context);
            definitionGroups.push(definitionGroup);
        }

        return definitionGroups;
    }

    parseDefinitionGroup($, element, context){
        context[this.DEFINITION_GROUP] = element;

        let groupNameElements = this.findElements($, element, this.selector(this.GROUP_NAME), context);
        let name = groupNameElements.text();
        
        name=name.trim();
        let inflection = $(element).find(this.selector(this.INFLECTION)).text();

        let definitions = [];

        let definitionElements = this.findElements($, element, this.selector(this.DEFINITION), context);
        for(let definitionElement of definitionElements){
            let definition = this.parseDefinition($, definitionElement, context);
            definitions.push(definition);
        }
        let definitionGroup = {name, inflection, definitions};
        this.afterParseDefinitionGroup(definitionGroup);
        return definitionGroup;
    }

    getDefinitionText($, element, context){
        return $(element).text(); 
    }

    parseDefinition($, element, context){
        
        let text = this.getDefinitionText($, element, context);        
        
        text = this.beforeParseDefinition(text);    

        let subdefinitions = text.split(',');    
        subdefinitions = subdefinitions.map(item => this.trimSubdefinition(item));    
        let definition = { text, subdefinitions };

        this.afterParseDefinition(definition)

        return definition;
    }
    
    parse(rawDefinition) {
        rawDefinition = this.beforeParse(rawDefinition);

        let html = rawDefinition;

        let link = this.getLink(html);
        if (link) {
            let linkEntry = this.createEntryForLink(link);
            return [ linkEntry ];
        }

        const $ = cheerio.load(html);
        
        let context = {};
        context[this.ROOT] = null;

        let entries = this.parseEntries($, context);

        this.afterParse(entries);

        return entries; 
    }
    
}

export { GenericSelectorParser }