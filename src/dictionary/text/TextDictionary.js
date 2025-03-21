import {Dictionary} from '../Dictionary.js'
import { dataURItoText } from '../../utils/fileUtils.js'
import { parseTextDefinitionV2 } from './textDefinitionUtils.js'

class TextDictionary extends Dictionary {
    constructor(data, name) {
        super(data, name);

        const { raw, index } = data;
        

        if(raw){
            const fileMap = raw;
            let textFile = this.getDataUriFile(fileMap, '.txt');            
            let text = dataURItoText(textFile.dataUri);
            let array = text.split(/\r*\n/);
            this.size = array.length;

            this.map = this.generateMap(array);
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
            return { definition };
        }
    }

    parse(definition){
        return parseTextDefinitionV2(definition);
    }

    lookupFromRaw(query, options){        
        let result = null;        
    
        let entries = [];

        let rawLookupResult = this.lookupFromMap(this.map, query);
        if(rawLookupResult){
            result = {};

            let rawDefinition = rawLookupResult.definition;

            if(options.outputFormats.includes('raw')){            
                result['raw'] = rawDefinition;
            }                

            let needParsing = options.outputFormats.length > 0;
            if(needParsing && rawDefinition){
                entries = this.parse(rawDefinition);
                
                //only auto jump when there is only one entry and it is a link
                if(entries.length == 1 && entries[0].type == 'link' 
                    && options.autoJumpLink && options.jumpingTimes < options.maxJumpingTimes){
                    options.jumpingTimes ++;
    
                    let entry = entries[0];
                    let link = entry.link;
                    console.log(`autojump to: ${link}`);
                    entries = this.lookup(link, options);
                }

                if(options.outputFormats.includes('json')){            
                    result['json'] = entries;
                }
        
                if(options.outputFormats.includes('text')){
                    let textDefinition = this.toTextDefinition(entries);
                    result['text'] = textDefinition;
                }
            }
        }            
    
        return result;
    }
}

export { TextDictionary }