
import { getSystemDictionaryFromCache } from './dictionary/systemDictionary.js'
import { getCustomDictionaryFromCache, getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
                                          

function createDefaultOptions(){
    return { outputFormats:['text', 'json']};
}

function patchOptions(options){
    return Object.assign(createDefaultOptions(), options);
}

function lookup(word, options, dicts) {
    options = patchOptions(options);
    //console.log(word);
    if(!dicts){
        dicts = getEnabledDictionaryNamesFromCache();
    }

    //replace single quotation
    if(word){
        word = word.replaceAll(/[’]/g, "'");
    }    

    //try small dict first, hits 90%
    let lookupResult;

    for(let name of dicts){
        let dict = getDictFromCache(name);
        
        if(dict){
            lookupResult = dict.lookup(word, options);
            
            let accepted;
            if(options.acceptResult){
                accepted = options.acceptResult(lookupResult);
            } else {
                accepted = (lookupResult != null)
            }

            if(accepted){

                lookupResult.dictionaryName = name;
                //console.log(`found ${word} in ${name}: ${JSON.stringify(lookupResult)}`);
                break;                
            }
        }        
    }    

    return lookupResult;
}

function getDictFromCache(name){
    let dict = getSystemDictionaryFromCache(name);
    if(!dict){
        dict = getCustomDictionaryFromCache(name);
    } 

    return dict;
    
}




export { lookup };