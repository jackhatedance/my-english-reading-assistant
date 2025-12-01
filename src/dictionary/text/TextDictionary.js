import {Dictionary} from '../Dictionary.js'
import { dataURItoText } from '../../utils/fileUtils.js'
import { TextDefinitionParser } from './TextDefinitionParser.js'
import { parseLine } from './textDefinitionUtils.js'

const COMMENT_PREFIX = '#';
const META_PREFIX = '@@@';

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

            let {map, meta} = this.generateMap(array);
            this.map = map;

            let formatVersion = meta.version;
            if(formatVersion==''){
                formatVersion = '1';
            }

            let parserOptions = { formatVersion: formatVersion };
            this.definitionParser = new TextDefinitionParser(parserOptions);
        }        
    }

    generateMap(array){
        let lines = array;

        let map = {};
        let meta = {};
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

                let isComment = word.startsWith(COMMENT_PREFIX);
                if(isComment){
                    let commentContent = word.substring(1);
                    let isMeta = commentContent.startsWith(META_PREFIX);
                    if(isMeta){
                        let metaKey = commentContent.substring(META_PREFIX.length);
                        meta[metaKey] = definition;
                    }    
                } else{
                    map[word] = definition;
                }
            } catch(e){
                console.warn('failed to parse dictionary line:'+line);
            }
            
        }

        return { meta, map };
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