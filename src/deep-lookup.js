import {lookup, isOnlyTransform, getTheOnlyBaseForm } from './dictionaries.js';

function deepLookup(lookupResult, options){
    let deepLookupResult;
    const dicts = [lookupResult.dictionary];
    
    if(!deepLookupResult){        
        deepLookupResult = deepLookupOnlyTransform(lookupResult, options, dicts);
    }

    if(!deepLookupResult){        
        deepLookupResult = deepLookupTransformParticipleOnlyByText(lookupResult, options, dicts);
    }

    if(!deepLookupResult){                        
        deepLookupResult = deepLookupTransformPluralOnlyByText(lookupResult, options, dicts);
    }

    return deepLookupResult;
}

function deepLookupOnlyTransform(originalLookupResult, options, dicts){
    if(isOnlyTransform(originalLookupResult)){
        let base = getTheOnlyBaseForm(originalLookupResult);
        let lookupResult = lookup(base, options, dicts);
        if(lookupResult) {
            let type = 'transform';
            let word = base;

            return { lookupResult, type, word};
        }
    }  
}

function deepLookupTransformParticipleOnlyByText(originalLookupResult, dicts){
    //console.log(input);
    let result = originalLookupResult.text.match('^([a-zA-Z]+)的((过去式)|(过去分词)|(过去式和过去分词)|(现在分词))'); 
        
    //console.log('match result 1:'+result);   
    if(result != null){
        let base = result[1];
        let lookupResult = lookup(base, options, dicts);
        if(lookupResult) {
            let type = 'transform';
            let lemmaType = 'irregular';
            let word = base;

            return { lookupResult, type, word, lemmaType };
        }
    } 
}

function deepLookupTransformPluralOnlyByText(originalLookupResult, dicts){
    let result = originalLookupResult.text.match('([a-zA-Z]+) ?的((复数)|(名词复数))');
    if(result != null){
        let base = result[1];
        let lookupResult = lookup(base, options, dicts);
        if(lookupResult){
            let type = 'transform';
            let lemmaType = 'plural';
            let word = base;

            return { lookupResult, type, word, lemmaType };
        }
    }
}

export { deepLookup }