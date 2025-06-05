import { MdictDefinitionParser } from '../MdictDefinitionParser.js'
import * as cheerio from 'cheerio';
import { findMostAccurateTypedDefinition } from '../../typed-definition.js'
import { PARSER_OPTION_DEBUG_PRINT_SELECTOR_FIND, ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE } from '../../dictConstants.js'
import { getLink, getEntryFromLink, isAllUpperCaseEntry } from '../mdict-definition-utils.js'
import { createLinkDefinition, createEntryForLink } from '../../entry-utils.js'

class JsonSelectorParser extends MdictDefinitionParser {
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
    PHRASE = 'phrase';
    LINK_ENTRY = 'linkEntry';

    
    hasSelector(entitySelector, name){
        return entitySelector.hasOwnProperty(name);
    }
    
    findElementsByOneSelector($, baseElement, selector, context){    
        //console.log(`find by selector: ${selector}`);         
        if(selector.includes('/')){
            let array = selector.split('/');
            let elementName = array[0];
            if(array.length >= 2){
                selector = array[1];
            } else {
                selector = null;
            }

            baseElement = context[elementName];                        
        }

        if(baseElement){
            if(selector){
                return $(baseElement).find(selector);        
            }else {
                return [baseElement];        
            }            
        }else{
            return $(selector);        
        }
    }

    findElements($, containerElement, entitySelectors, name, context){    
        if(!entitySelectors){
            return [];
        }    
        
        let entitySelectorArray;
        if(Array.isArray(entitySelectors)){
            entitySelectorArray = entitySelectors;            
        } else {
            entitySelectorArray = [ entitySelectors ];
        }

        let result = [];
        let groupSet = new Set();
        
        for(let entitySelector of entitySelectorArray){    
            let group = 'default';
            if(entitySelector.hasOwnProperty('group')){
                group = entitySelector.group;
            }
            if(groupSet.has(group)){
                continue;
            }

            let item = null;
            if(entitySelector.hasOwnProperty('testSelector')){
                let elements = this.findElementsByOneSelector($, containerElement, entitySelector.testSelector, context);
                if(elements.length>0){
                    let elements = this.findElementsByOneSelector($, containerElement, entitySelector.selector, context);
                    if(elements.length>0){
                        item = { elements, entitySelector };
                    }
                }
            } else {
                let elements = this.findElementsByOneSelector($, containerElement, entitySelector.selector, context);
                if(elements.length>0){
                    item = { elements, entitySelector };
                }
            }
            
            if(item){
                result.push(item);
                groupSet.add(group);
                this.logFindResult(name, item);                    
            }
            
        }        

        return result;
    }

    logFindResult(name, result){
        if(result && this.options[PARSER_OPTION_DEBUG_PRINT_SELECTOR_FIND] == true){
            if(result.entitySelector.name){
                console.log(`find [${name}], name: ${result.entitySelector.name}`);
            } else if(result.entitySelector.testSelector){
                console.log(`find [${name}], testSelector: ${result.entitySelector.testSelector}`);                
            } else{
                console.log(`find [${name}], selector: ${result.entitySelector.selector}`);                
            }
        }
    }
        
    parse(rawDefinition) {
        rawDefinition = this.beforeParse(rawDefinition);

        let link = getLink(rawDefinition);
        if (link) {
            let linkEntry = createEntryForLink(link);
            return [ linkEntry ];
        }

        let html = rawDefinition;
        
        const $ = cheerio.load(html);
        
        let context = {};
        context[this.ROOT] = null;

        let entries = this.parseEntries($, context);

        this.afterParse(entries);

        return entries; 
    }

    /**
     * virtual means base element of its children is not itself, but its parent.
     * @param {*} parentElement 
     * @param {*} childElement 
     * @param {*} childEntitySelector 
     * @returns 
     */
    getBaseElementForChild(parentElement, childElement, childEntitySelector){
        return childEntitySelector.virtual == true ? parentElement : childElement;            
    }

    parseEntries($, context){
        let entries = [];

        let findElementsResults = this.findElements($, null, this.entriesSelector[this.ENTRY], this.ENTRY, context);
        for(let findElementsResult of findElementsResults){
            let childEntitySelector = findElementsResult.entitySelector;
            for(let entryElement of findElementsResult.elements){  
                let baseElement = this.getBaseElementForChild(null, entryElement, childEntitySelector);          
                let entry = this.parseEntry($, baseElement, context, childEntitySelector);
                entries.push(entry);
            }   
        }        
        return entries;        
    }

    parseEntry($, element, context, entitySelector){
        context[this.ENTRY] = element;

        let headword = { pronunciations: [] };
        if(this.hasSelector(entitySelector, this.HEADWORD)){
            let findElementsResults = this.findElements($, element, entitySelector[this.HEADWORD], this.HEADWORD, context);
            
            if(findElementsResults.length > 0){
                let childEntitySelector = findElementsResults[0].entitySelector;
                let headWordElement = findElementsResults[0].elements[0];
                let baseElement = this.getBaseElementForChild(element, headWordElement, childEntitySelector); 
                headword = this.parseHeadword($, baseElement, context, childEntitySelector);
            }
        }
        
        let definitionGroups = this.parseDefinitionGroups($, element, context, entitySelector);
        
        let phrases = [];
        if(this.hasSelector(entitySelector, this.PHRASE)){
            let findElementsResults = this.findElements($, element, entitySelector[this.PHRASE], this.PHRASE, context);
            for(let findElementsResult of findElementsResults){
                
                for(let phraseElement of findElementsResult.elements){
                    let childEntitySelector = findElementsResult.entitySelector;
                    let phrase = this.parsePhrase($, phraseElement, childEntitySelector);    
                    phrases.push(phrase);
                }   
            }

        }

        return { headword, definitionGroups, phrases };        
    }

    parseHeadword($, element, context, entitySelector){
        context[this.HEADWORD] = element;

        let pronunciations = this.parsePronunciations($, element, context, entitySelector);    
        pronunciations = this.convertPronunciations(pronunciations);
        
        return { pronunciations };
    }
    
    parsePronunciations($, element, context, entitySelector){
        let pronunciations = [];

        let findElementsResults = this.findElements($, element, entitySelector[this.PRONUNCIATION], this.PRONUNCIATION, context);
        for(let findElementsResult of findElementsResults){
            let childEntitySelector = findElementsResult.entitySelector;
            for(let pronunciationElement of findElementsResult.elements){
                let baseElement = this.getBaseElementForChild(element, pronunciationElement, childEntitySelector); 
                let pronunciation = this.parsePronunciation($, baseElement, context, childEntitySelector);
            
                pronunciations.push(pronunciation);
            }
        }
        return pronunciations;
    }

    parsePronunciation($, element, context, entitySelector){
        this.beforeParsePronunciation($, element, context);

        let pronunciation;
        if(this.hasSelector(entitySelector, this.PRONUNCIATION_NAME) && this.hasSelector(entitySelector, this.PRONUNCIATION_PHONETICS)){
            let name = parserPronunciationName($, element, context, entitySelector);
            let phonetics = parserPronunciationPhonetics($, element, context, entitySelector);
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

    parserPronunciationName($, element, context, entitySelector){
        if(this.hasSelector(entitySelector, this.PRONUNCIATION_NAME)){
            let findElementsResults = this.findElements($, element, entitySelector[this.PRONUNCIATION_NAME], this.PRONUNCIATION_NAME, context);
            if(findElementsResults.length > 0){
                let pronunciationNameElements = findElementsResults[0].elements;
                return pronunciationNameElements.text();
            }
        } else {
            return '';
        }
    }

    parserPronunciationPhonetics($, element, context, entitySelector){
        if(this.hasSelector(this.PRONUNCIATION_PHONETICSNAME)){
            let findElementsResults = this.findElements($, element, this.selector(this.PRONUNCIATION_PHONETICS), this.PRONUNCIATION_PHONETICS, context);
            if(findElementsResults.length > 0){
                let pronunciationPhoneticsElements = findElementsResults[0].elements;
                return pronunciationPhoneticsElements.text();
            }
        } else {
            return '';
        }
    }

    parseDefinitionGroups($, element, context, entitySelector){
        let definitionGroups = [];

        let findElementsResults = this.findElements($, element, entitySelector[this.DEFINITION_GROUP], this.DEFINITION_GROUP, context);
        for(let findElementsResult of findElementsResults){
            let childEntitySelector = findElementsResult.entitySelector;
            for(let groupElement of findElementsResult.elements){
                let baseElement = this.getBaseElementForChild(element, groupElement, childEntitySelector); 
                let definitionGroup = this.parseDefinitionGroup($, baseElement, context, childEntitySelector);
                definitionGroups.push(definitionGroup);
            }
        }
        return definitionGroups;
    }

    parseDefinitionGroup($, element, context, entitySelector){
        context[this.DEFINITION_GROUP] = element;

        let findElementsResults = this.findElements($, element, entitySelector[this.GROUP_NAME], this.GROUP_NAME, context);
        let name = '';
        if(findElementsResults.length > 0){
            let definitionGroupNameElements = findElementsResults[0].elements;

            if(definitionGroupNameElements.length>0){
                name = $(definitionGroupNameElements[0]).text();    
            }
            
            name= name.trim();
        }

        let inflection;
        
        findElementsResults = this.findElements($, element, entitySelector[this.INFLECTION], this.INFLECTION, context);
        if(findElementsResults.length > 0){
            let inflectionElements = findElementsResults[0].elements;

            inflection = inflectionElements.text();
        }
    
        let definitions = [];
        findElementsResults = this.findElements($, element, entitySelector[this.DEFINITION], this.DEFINITION, context);
        for(let findElementsResult of findElementsResults){
            let childEntitySelector = findElementsResult.entitySelector;
            for(let definitionElement of findElementsResult.elements){
                let baseElement = this.getBaseElementForChild(element, definitionElement, childEntitySelector); 
                let definition = this.parseDefinition($, baseElement, context, childEntitySelector);
                definitions.push(definition);
            }   
        }

        let definitionGroup = {name, inflection, definitions};
        this.afterParseDefinitionGroup(definitionGroup);
        return definitionGroup;
    }

    beforeParseDefinitionElement($, element, context){
        //manipulate dom
    }

    detectLinkDefinitionOfElement($, element, context){
        let linkElements = $(element).find('a[href^="entry:"]');
        if(linkElements.length == 1){
            let linkElement = linkElements[0];
            let href = $(linkElement).attr('href');
            let entry = getEntryFromLink(href);
            if(entry && isAllUpperCaseEntry(entry)){
                if(this.getAllUpperCaseEntryPolicy() == ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE){
                    entry = entry.toLowerCase();
                }
            }
            return createLinkDefinition(entry);
        }
    }

    detectTypedDefinitionOfElement($, element, context){
        let definition = this.detectLinkDefinitionOfElement($, element, context);
        return definition;
    }
 
    removeDefinitionSubelements($, element, context, entitySelector){
        if(entitySelector.removeSelector){
            let text = $(element).text();
            let parenthesesText = $(element).find(entitySelector.removeSelector).text();
            let mainText = text.replace(parenthesesText, '');
            if (this.trimDefinition(mainText).length > 0) {
                $(element).find(entitySelector.removeSelector).remove();
            }
        }
    }

    parseDefinition($, element, context, entitySelector){
        this.beforeParseDefinitionElement($, element, context);
        
        this.removeDefinitionSubelements($, element, context, entitySelector);

        let typedDefinitions = [];
        let typedDefinitionOfElement = this.detectTypedDefinitionOfElement($, element, context);
        if(typedDefinitionOfElement){
            typedDefinitions.push(typedDefinitionOfElement);
        }

        let text = this.getDefinitionText($, element, entitySelector); 
        
        let definition = this.parseDefinitionText(text);    

        let typedDefinitionOfText = this.detectTypedDefinitionOfText(text);
        if(typedDefinitionOfText){
            typedDefinitions.push(typedDefinitionOfText);
        }     
                        
        let typedDefinition = findMostAccurateTypedDefinition(typedDefinitions);
        if(typedDefinition){
            this.assginTypedDefinition(definition, typedDefinition);
        }

        this.afterParseDefinition(definition);

        return definition;
    }

    getDefinitionText($, element, entitySelector){
        let text;
        text = $(element).text(); 
        
        return text;
    }

    beforeParsePhraseText(text){
        return text;
    }

    parsePhrase($, element, entitySelector){
        let phrase = $(element).text();  

        phrase = this.beforeParsePhraseText(phrase);
        return phrase;
    }
        
}

export { JsonSelectorParser }