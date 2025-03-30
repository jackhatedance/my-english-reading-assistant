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

    createEntryForLink(link){
        let definition = {
            text: `见${link}`,
            type: 'link',
            link: link,
        };
        
        let definitions = [definition];
        let definitionGroup = { type:'link', "name": 'link', "definitions": definitions };        
        
        let pronunciation = '';
        let definitionGroups = [ definitionGroup ];
        
        let entry = { pronunciation, definitionGroups };
        return entry;
    }

}

export { MdictDefinitionParser }