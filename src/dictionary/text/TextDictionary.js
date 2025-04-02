import {Dictionary} from '../Dictionary.js'
import { dataURItoText } from '../../utils/fileUtils.js'
import { TextDefinitionParser } from './TextDefinitionParser.js'

class TextDictionary extends Dictionary {
    constructor(data, name, options) {
        super(data, name, options);

        const { raw, index } = data;
        

        if(raw){
            const fileMap = raw;
            let textFile = this.getDataUriFile(fileMap, '.txt');            
            let text = dataURItoText(textFile.dataUri);
            let array = text.split(/\r*\n/);
            this.size = array.length;

            this.map = this.generateMap(array);

            this.definitionParser = new TextDefinitionParser();
        }        
    }

    generateMap(array){
        let lines = array;

        let map = {};
        for(let line of lines){
            try{
                const firstSpaceIndex = line.indexOf(" ");
                let word = line.substring(0, firstSpaceIndex);
                let definition = line.substring(firstSpaceIndex+1);
                map[word] = definition;
            } catch(e){
                console.warn('failed to parse dictionary line:'+line);
            }
            
        }

        return map;
    }

    getRawMeta(){
        return {};
    }

    getKeys(){        
        return Object.keys(this.map);
    }

    lookupFromMap(map, query){
        if(map && map.hasOwnProperty(query)){
            let definition = map[query];
            return definition;
        }
    }
    
    lookupRaw(query) {
        return this.lookupFromMap(this.map, query);
    }
    
    rawToJson(definition){
        return this.definitionParser.parse(definition);
    }
        
}

export { TextDictionary }