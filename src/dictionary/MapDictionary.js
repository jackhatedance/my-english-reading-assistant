import {Dictionary} from './Dictionary.js'
import {parseTextDefinitionV2} from './text/textDefinitionUtils.js'

class MapDictionary extends Dictionary {
    constructor(data, name) {
        super(data, name);

        this.size = Object.keys(data.raw).length;;
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
        return parseTextDefinitionV2(definition);
    }

    lookupFromIndex(query, options){
        return this.lookupFromRaw(query, options);
    }
}

export { MapDictionary }