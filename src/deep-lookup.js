import {lookup } from './dictionaries.js';
import { isOnlyTransform, getTheOnlyBaseForm, hasLinkDefinitionOnly, getTheOnlyLinkDefintion } from './dictionary/entry-utils.js';

function deepLookup(lookupResult, options){
    let deepLookupResult;
    const maxDepth = 2;
    for(let i=0; i< maxDepth; i++){
        let _deepLookupResult = _deepLookup(lookupResult, options);
        if(_deepLookupResult){
            deepLookupResult = _deepLookupResult;
            lookupResult = _deepLookupResult.lookupResult;
        } else {
            break;
        }
    }
    return deepLookupResult;
}

function _deepLookup(lookupResult, options){
    let deepLookupResult;
    const dicts = [lookupResult.dictionaryName];
    
    if(!deepLookupResult){        
        deepLookupResult = deepLookupOnlyLink(lookupResult, options, dicts);
    }
        
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
    if(isOnlyTransform(originalLookupResult.json)){
        let base = getTheOnlyBaseForm(originalLookupResult.json);
        let lookupResult = lookup(base, options, dicts);
        if(lookupResult) {
            let type = 'transform';
            let word = base;

            return { lookupResult, type, word};
        }
    }  
}

function deepLookupOnlyLink(originalLookupResult, options, dicts){
    if(hasLinkDefinitionOnly(originalLookupResult.json)){
        let linkDefinition = getTheOnlyLinkDefintion(originalLookupResult.json);
        let link = linkDefinition.link;    
        let lookupResult = lookup(link, options, dicts); 
        if(lookupResult) {
            let type = 'link';
            let word = link;

            return { lookupResult, type, word};
        }
    }  
}

function deepLookupTransformParticipleOnlyByText(originalLookupResult, options, dicts){
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

function deepLookupTransformPluralOnlyByText(originalLookupResult, options, dicts){
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