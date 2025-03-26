class MdictParser {
    

    parse() {
        throw new Error('not implemented');
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

export { MdictParser }