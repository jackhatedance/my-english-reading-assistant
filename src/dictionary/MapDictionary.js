import {Dictionary} from './Dictionary.js'
import { TextDefinitionParser } from './text/TextDefinitionParser.js'

class MapDictionary extends Dictionary {
    constructor(data, name, options) {
        super(data, name, options);

        this.size = Object.keys(data.raw).length;

        let parserOptions = [];
        
        this.definitionParser = new TextDefinitionParser(parserOptions);
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
    
    rawToJson(query, definition){
        return this.definitionParser.parse(query, definition);
    }

    lookupFromIndex(query, options){
        return this.lookupFromRaw(query, options);
    }

    supportOutputFormat(format){
        return ['raw', 'text', 'json'].includes(format);
    }

    createText(query, result, options){
        if(!result.raw){
            result.raw = this.lookupRaw(result.query);
        }
       
        result.text = result.raw;
    }
}

export { MapDictionary }