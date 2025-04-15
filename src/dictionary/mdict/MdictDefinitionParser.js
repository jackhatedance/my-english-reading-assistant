import { DefinitionParser } from '../DefinitionParser.js'
class MdictDefinitionParser extends DefinitionParser {
    getLink(html){
        if(html){
            let matchResult = html.trim().match(/^@@@LINK=(.*)\r*\n*\u0000*$/);
            if(matchResult){
                return matchResult[1];
            }
        }
        return null;    
    }

    createLinkDefinition(link){
        let text = `转${link}`;

        return {
            text: text,
            subdefinitions: [text],
            type: 'link',
            link: link,
        };
    }

    createEntryForLink(link){
        let definition = this.createLinkDefinition(link);        
        let definitions = [definition];
        let definitionGroup = { name: 'link', "definitions": definitions };        
        
        let pronunciations = [];
        let headword = { pronunciations };
        let definitionGroups = [ definitionGroup ];
        
        let entry = { headword, definitionGroups, type: 'link' };
        return entry;
    }

}

export { MdictDefinitionParser }