import { DefinitionParser } from '../DefinitionParser.js'
class MdictDefinitionParser extends DefinitionParser {
    
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