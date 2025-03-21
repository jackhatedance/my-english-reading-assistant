class MdictParser {
    

    parse() {
        throw new Error('not implemented');
    }

    createEntryForLink(link){
        
        let definitions = [link];
        let definitionGroup = { type:'link', "name": 'link', "definitions": definitions };        
        
        let pronunciation = '';
        let definitionGroups = [ definitionGroup ];
        
        let entry = { pronunciation, definitionGroups };
        return entry;
    }

}

export { MdictParser }