import {Dictionary} from '../Dictionary.js'
import { dataURItoText } from '../../utils/fileUtils.js'
import { TextDefinitionParser } from './TextDefinitionParser.js'
import { parseLine } from './textDefinitionUtils.js'

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
            if(!line){
                continue;
            }
            line = line.trim();
            if(line.length==0){
                continue;
            }
            
            try{
                const { word, definition } = parseLine(line);

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

    supportOutputFormat(format){
        return ['raw', 'text', 'json'].includes(format);
    }
        
}

export { TextDictionary }