import { MdictDefinitionParser } from '../MdictDefinitionParser.js'
import * as cheerio from 'cheerio';
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { removeParentheses } from '../../../text/textUtils.js'
import { eliminateFontFaces } from '../css/css.js'
import { base64toText } from '../../../utils/fileUtils.js'

class GenericSelectorParser extends MdictDefinitionParser {
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
            let definition = this.parseDefinition($, definitionElement);
            definitions.push(definition);
        }
        let definitionGroup = {name, inflection, definitions};
        this.afterParseDefinitionGroup(definitionGroup);
        return definitionGroup;
    }

    

    parseDefinition($, element){
        let text = $(element).text();
        if(!text){
            text = '';
        }
        text = this.trimDefinition(text);    

        text = removeParentheses(text);
        text = text.split(',')[0];        
        let definition = { text };

        this.afterParseDefinition(definition)

        return definition;
    }
    


    parse(rawDefinition) {
        rawDefinition = this.beforeParse(rawDefinition);

        let html = rawDefinition;

        const $ = cheerio.load(html);
        let entries = this.parseEntries($);

        this.afterParse(entries);

        return entries; 
    }


    trimDefinition(text){
        text = text.replaceAll(/[;]/g, ',')
        return super.trimDefinition(text);
    }

    toHtml(rawDefinition, getResource) {
        const $ = cheerio.load(rawDefinition);
                
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
            let resource = getResouce(key);

            $(element).prop('src', resource);            
        }

        return $.html();
    }
}

export { GenericSelectorParser }