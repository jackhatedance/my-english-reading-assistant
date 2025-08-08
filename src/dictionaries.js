
import { getSystemDictionaryFromCache } from './dictionary/systemDictionary.js'
import { getCustomDictionaryFromCache, getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
import { hasOnlyLinkOrFormDefinition } from './dictionary/entry-utils.js'

function createDefaultOptions(){
    return { outputFormats:['text', 'json'], stopOnFirstResult: true };
}

function patchOptions(options){
    return Object.assign(createDefaultOptions(), options);
}

function lookup(word, options, dicts) {
    options = patchOptions(options);
    //console.log(word);
    //console.log(options);
    if(!dicts){
        dicts = getEnabledDictionaryNamesFromCache();
    }

    //replace single quotation
    if(word){
        word = word.replaceAll(/[’]/g, "'");
    }    

    //try small dict first, hits 90%
    let lookupResults = [];

    for(let name of dicts){
        let dict = getDictFromCache(name);
        
        if(dict){
            let lookupResult = dict.lookup(word, options);
            
            let accepted;
            if(options.acceptResult){
                accepted = options.acceptResult(lookupResult);
            } else {
                accepted = (lookupResult != null)
            }

            if(accepted){

                lookupResult.dictionaryName = name;
                
                lookupResults.push(lookupResult);
                if(options.stopOnFirstResult){
                    break;
                }
            }
        }        
    }    

    //find the best one
    let result = null;
    let score = -1;
    if(lookupResults.length > 0){
        for(let item of lookupResults){
            let itemScore = calculateLookupResultScore(item);
            if(itemScore > score){
                result = item;
                score = itemScore;
            }
        }
    }
    
    if(result){
        var index = lookupResults.indexOf(result);
        if (index !== -1) {
            lookupResults.splice(index, 1);
        }

        result.rest = lookupResults;

        //console.log(`found ${word} in ${result.dictionaryName}: ${JSON.stringify(result)}`);

    }

    return result;
}

function calculateLookupResultScore(lookupResult) {
    if(hasOnlyLinkOrFormDefinition(lookupResult.json)){
        return 10;
    } else {
        return 20;
    }
}

function getDictFromCache(name){
    let dict = getSystemDictionaryFromCache(name);
    if(!dict){
        dict = getCustomDictionaryFromCache(name);
    } 

    return dict;
    
}




export { lookup };