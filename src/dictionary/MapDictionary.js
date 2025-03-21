import {Dictionary} from './Dictionary.js'

class MapDictionary extends Dictionary {
    constructor(data, name) {
        super(data, name);

        this.size = Object.keys(data.raw).length;;
    }

    lookup(query){
        const map = this.data.raw;
        if(map && map.hasOwnProperty(query)){
            let def = map[query];
            return def;
        }
    }
}

export { MapDictionary }