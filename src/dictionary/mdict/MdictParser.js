class MdictParser {
    

    parse() {
        throw new Error('not implemented');
    }

    createEntryForLink(link){
        
        let definitions = [link];
        let definitionGroup = { type:'link', "name": 'link', "definitions": definitions };        
        
        let pronunciation = '';
        let definitionGroups = [ definitionGroup ];
        
        let type = 'link';
        
        let entry = { type, link, pronunciation, definitionGroups };
        return entry;
    }

}

export { MdictParser }