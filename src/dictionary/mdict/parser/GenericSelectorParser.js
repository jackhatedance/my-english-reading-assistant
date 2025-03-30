import { MdictDefinitionParser } from '../MdictDefinitionParser.js'
import * as cheerio from 'cheerio';

import { eliminateFontFaces, createDataUrl } from '../css/css.js'
import { base64toText } from '../../../utils/fileUtils.js'


class GenericSelectorParser extends MdictDefinitionParser {
    ROOT = 'root';
    ENTRY = 'entry';
    PRONUNCIATION = 'pronunciation';
    DEFINITION_GROUP = 'definitionGroup';
    GROUP_NAME = 'groupName';
    INFLECTION = "inflection";
    DEFINITION = 'definition';
    

    selector(name){
        return this.selectors[name];
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

        for(let selector of selectorArray){
            let elements = this.findElementsByOneSelector($, containerElement, selector, context);
            if(elements.length>0){
                return elements;
            }
        }        

        return [];
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

        let pronunciation = this.parsePronunciation($, element, context);    
        let definitionGroups = this.parseDefinitionGroups($, element, context);
        return { pronunciation, definitionGroups };
    }

    parsePronunciation($, element, context){
        let elements = this.findElements($, element, this.selector(this.PRONUNCIATION), context);
        
        let pronunciation = '';
        if(elements.length>0){
            let textArray = elements.toArray().map(item => this.trimPronounciation($(item).text()));

            pronunciation = textArray.join(',');
        }
        
        return this.trimPronounciation(pronunciation);
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

        let name = $(element).find(this.selector(this.GROUP_NAME)).text();
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

    

    parseDefinition($, element, context){
        let text = $(element).text();
        
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


    

    toHtml(rawDefinition, getResource) {
        const $ = cheerio.load(rawDefinition, null, false);
                
        let stylesheetElements = $('link[rel="stylesheet"]');
        for(let element of stylesheetElements){
            let href = $(element).attr('href');
            let key = `\\${href}`;
            let resource = getResource(key);
            //console.log(resource);
            const css = base64toText(resource);
            //let css2 = replaceFontFaceSrcUrlWithDataUrl(css, getResource);
            let css2 = eliminateFontFaces(css)
            //console.log(css2);
            let style = `<style>${css2}</style>`;
            var styleElement = $(style);
            $(element).replaceWith(styleElement);
        }

        let scriptElements = $('script[type="text/javascript"]');
        for(let element of scriptElements){
            let src = $(element).prop('src');
            let key = `\\${src}`;
            let resource = getResource(key);

            $(element).prop('src', resource);            
        }

        let imgElements = $('img');
        for(let element of imgElements){
            let src = $(element).prop('src');
            
            let dataUrl = createDataUrl(src, getResource);
            

            $(element).prop('src', dataUrl);            
        }

        return $.html();
    }
}

export { GenericSelectorParser }