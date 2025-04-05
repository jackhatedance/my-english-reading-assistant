import {Dictionary} from './Dictionary.js'
import { TextDefinitionParser } from './text/TextDefinitionParser.js'

class MapDictionary extends Dictionary {
    constructor(data, name, options) {
        super(data, name, options);

        this.size = Object.keys(data.raw).length;
        this.definitionParser = new TextDefinitionParser();
    }

    lookupFromMap(map, query){
        if(map && map.hasOwnProperty(query)){
            return map[query];
        }
    }

    lookupRaw(query) {
        const map = this.data.raw;
        return this.lookupFromMap(map, query);
    }
    
    rawToJson(definition){
        return this.definitionParser.parse(definition);
    }

    lookupFromIndex(query, options){
        return this.lookupFromRaw(query, options);
    }

    supportOutputFormat(format){
        return true;
    }
}

export { MapDictionary }