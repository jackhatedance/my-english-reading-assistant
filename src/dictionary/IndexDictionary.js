import { Dictionary } from './Dictionary.js'

class IndexDictionary extends Dictionary {
    constructor(data, name) {
        super(data, name);

        const { raw, index } = data;

        if(index){
            
            
        }
        
    }

    generateDefaultOptions(){
        return {
            fromRaw: false,
            autoJumpLink: true,
            maxJumpingTimes: 3,
            jumpingTimes: 0,
            outputFormats:['text', 'json']
        };
    }

    patchDefaultValues(options){
        let defaultOptions = this.generateDefaultOptions();
        return Object.assign(defaultOptions, options);
    }

    lookup(query, options) {
        options = this.patchDefaultValues(options);

        let result = null;
        if(this.data.index && this.data.index.data.hasOwnProperty(query)){
            result = this.data.index.data[query];                
        }

        if(result){
            //clean ouput
            if(!options.outputFormats.includes('raw')){            
                delete result.raw;
            }

            if(!options.outputFormats.includes('json')){            
                delete result.json;
            }

            if(!options.outputFormats.includes('text')){
                delete result.text;
            }
        }
        return result;
    }
}