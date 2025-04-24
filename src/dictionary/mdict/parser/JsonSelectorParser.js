import { MdictDefinitionParser } from '../MdictDefinitionParser.js'
import * as cheerio from 'cheerio';
import { findMostAccurateTypedDefinition } from '../../typed-definition.js'
import { PARSER_OPTION_DEBUG_PRINT_SELECTOR_FIND } from '../../dictConstants.js'

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
    
    LINK_ENTRY = 'linkEntry';

    
    hasSelector(entitySelector, name){
        return entitySelector.hasOwnProperty(name);
    }
    
    findElementsByOneSelector($, baseElement, selector, context){    
        //console.log(`find by selector: ${selector}`);         
        if(selector.includes('/')){
            let array = selector.split('/');
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

    findElements($, containerElement, entitySelectors, name, context){    
        if(!entitySelectors){
            return null;
        }    
        
        let entitySelectorArray;
        if(Array.isArray(entitySelectors)){
            entitySelectorArray = entitySelectors;            
        } else {
            entitySelectorArray = [ entitySelectors ];
        }

        let result;
        
        for(let entitySelector of entitySelectorArray){    
            if(entitySelector.hasOwnProperty('testSelector')){
                let elements = this.findElementsByOneSelector($, containerElement, entitySelector.testSelector, context);
                if(elements.length>0){
                    let elements = this.findElementsByOneSelector($, containerElement, entitySelector.selector, context);
                    if(elements.length>0){
                        result = {elements, entitySelector };
                        break;
                    }
                }
            } else {
                let elements = this.findElementsByOneSelector($, containerElement, entitySelector.selector, context);
                if(elements.length>0){
                    result = {elements, entitySelector };
                    break;
                }
            }            
        }        

        if(result && this.options[PARSER_OPTION_DEBUG_PRINT_SELECTOR_FIND] == true){
            if(result.entitySelector.name){
                console.log(`find [${name}], name: ${result.entitySelector.name}`);
            } else if(result.entitySelector.testSelector){
                console.log(`find [${name}], testSelector: ${result.entitySelector.testSelector}`);                
            } else{
                console.log(`find [${name}], selector: ${result.entitySelector.selector}`);                
            }
            
        }
            
        return result;
    }
        
    parse(rawDefinition) {
        rawDefinition = this.beforeParse(rawDefinition);

        let link = this.getLink(rawDefinition);
        if (link) {
            let linkEntry = this.createEntryForLink(link);
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

    getBaseElementForChild(parentElement, childElement, childEntitySelector){
        return childEntitySelector.virtual == true ? parentElement : childElement;            
    }

    parseEntries($, context){
        let entries = [];

        let findElementsResult = this.findElements($, null, this.entriesSelector[this.ENTRY], this.ENTRY, context);
        if(findElementsResult){
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
            let findElementsResult = this.findElements($, element, entitySelector[this.HEADWORD], this.HEADWORD, context);
            
            if(findElementsResult){
                let childEntitySelector = findElementsResult.entitySelector;
                let headWordElement = findElementsResult.elements[0];
                let baseElement = this.getBaseElementForChild(element, headWordElement, childEntitySelector); 
                headword = this.parseHeadword($, baseElement, context, childEntitySelector);
            }
        }
        
        let definitionGroups = this.parseDefinitionGroups($, element, context, entitySelector);
            
        return { headword, definitionGroups };        
    }

    parseHeadword($, element, context, entitySelector){
        context[this.HEADWORD] = element;

        let pronunciations = this.parsePronunciations($, element, context, entitySelector);    
        pronunciations = this.convertPronunciations(pronunciations);
        
        return { pronunciations };
    }
    
    parsePronunciations($, element, context, entitySelector){
        let pronunciations = [];

        let findElementsResult = this.findElements($, element, entitySelector[this.PRONUNCIATION], this.PRONUNCIATION, context);
        if(findElementsResult){
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
            let findElementsResult = this.findElements($, element, entitySelector[this.PRONUNCIATION_NAME], this.PRONUNCIATION_NAME, context);
            if(findElementsResult){
                let pronunciationNameElements = findElementsResult.elements;
                return pronunciationNameElements.text();
            }
        } else {
            return '';
        }
    }

    parserPronunciationPhonetics($, element, context, entitySelector){
        if(this.hasSelector(this.PRONUNCIATION_PHONETICSNAME)){
            let findElementsResult = this.findElements($, element, this.selector(this.PRONUNCIATION_PHONETICS), this.PRONUNCIATION_PHONETICS, context);
            if(findElementsResult){
                let pronunciationPhoneticsElements = findElementsResult.elements;
                return pronunciationPhoneticsElements.text();
            }
        } else {
            return '';
        }
    }

    parseDefinitionGroups($, element, context, entitySelector){
        let definitionGroups = [];

        let findElementsResult = this.findElements($, element, entitySelector[this.DEFINITION_GROUP], this.DEFINITION_GROUP, context);
        if(findElementsResult){
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

        let findElementsResult = this.findElements($, element, entitySelector[this.GROUP_NAME], this.GROUP_NAME, context);
        let name = '';
        if(findElementsResult){
            let definitionGroupNameElements = findElementsResult.elements;

            name = definitionGroupNameElements.text();            
            name= name.trim();
        }

        let inflection;
        
        findElementsResult = this.findElements($, element, entitySelector[this.INFLECTION], this.INFLECTION, context);
        if(findElementsResult){
            let inflectionElements = findElementsResult.elements;

            inflection = inflectionElements.text();
        }
    
        let definitions = [];
        findElementsResult = this.findElements($, element, entitySelector[this.DEFINITION], this.DEFINITION, context);
        if(findElementsResult){
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
            let link = $(linkElement).text();
            let text = $(element).text();
            return this.createLinkDefinition(link);
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

        let text = $(element).text(); 
        
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
        
}

export { JsonSelectorParser }