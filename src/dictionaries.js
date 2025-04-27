
import { getSystemDictionary } from './dictionary/systemDictionary.js'
import { getCustomDictionary, getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
import { DICTIONARY_DEFINITION_TYPE_LINK, DICTIONARY_DEFINITION_TYPE_FORM } from './dictionary/dictConstants.js'                                           

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
        let dict = getDict(name);
        
        if(dict){
            lookupResult = dict.lookup(word, options);
            
            if(lookupResult){
                lookupResult.dictionaryName = name;
                //console.log(`found ${word} in ${name}: ${JSON.stringify(lookupResult)}`);
                break;                
            }
        }        
    }    

    return lookupResult;
}

function getDict(name){
    let dict = getSystemDictionary(name);
    if(!dict){
        dict = getCustomDictionary(name);
    } 

    return dict;
    
}




export { lookup };