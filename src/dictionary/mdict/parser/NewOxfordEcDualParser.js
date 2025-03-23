import { MdictParser } from '../MdictParser.js'
import * as cheerio from 'cheerio';
import { trimByCharacters } from '../../../utils/stringUtils.js'

class NewOxfordEcDualParser extends MdictParser {
    
    extractMainDef($, element){
        let mainDefinition = '';
    
        let defs = $(element).find('.defs');
        if(defs.length>0){        
            mainDefinition = $(defs[0]).find('>dl .def').text();
        } else{
            mainDefinition = $(element).find('>dl .def').text();
        }
        
        mainDefinition = mainDefinition.replaceAll(/[;]/g, ',');
        return this.trimDefinition(mainDefinition);
    }

    trimDefinition(text){
        if(!text){
            return '';
        }
        return trimByCharacters(text, '：。');
    }

    getLink(html){
        if(html){
            let matchResult = html.trim().match(/^@@@LINK=(\w*)\r*\n*\u0000*$/);
            if(matchResult){
                return matchResult[1];
            }
        }
        return null;    
    }

    parse(rawDefinition) {
        let html = rawDefinition;

        let link = this.getLink(html);
        if (link) {
            let linkEntry = this.createEntryForLink(link);
            return [ linkEntry ];
        }
        //const parsedHTML = $.parseHTML(html);
        const $ = cheerio.load(html);

        let odecnElements = $('.ODECN');
        let entries = [];
        for (let odecnElement of odecnElements) {

            //let pronunciation = $(parsedHTML).find('.pron').text();
            let pronunciation = $(odecnElement).find('.pron').text();

            let contentListElements = $('.content .cont-list');
            let definitionGroups = [];
            for (let contentElement of contentListElements) {
                let pos = $(contentElement).find('.pos').text();
                let inflection = $(contentElement).find('.pos .inflection').text();
                let group = pos;
                if(pos.includes(inflection)){
                    group = pos.replace(inflection, '');
                }

                let itemElements = $(contentElement).find('.item');
                let definitions = [];
                if (itemElements.length > 0) {
                    for (let itemElement of itemElements) {
                        //let mainDefinition = $(defs).find('>dl .def').text();
                        let mainDefinition = this.extractMainDef($, itemElement);

                        definitions.push(mainDefinition);
                    }
                } else {
                    let mainDefinition = this.extractMainDef($, contentElement);

                    definitions.push(mainDefinition);
                }

                let definitionGroup = { "name": group, "definitions": definitions };
                definitionGroups.push(definitionGroup);
            }
            let entry = { pronunciation, definitionGroups };
            entries.push(entry);
        }
        
        return entries;
    }
}

export { NewOxfordEcDualParser }