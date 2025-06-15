'use strict';

import {lookup } from './dictionaries.js';
import { hasOnlyLinkOrFormDefinition, findDefinitionsByTypes, createEntryForLink, createTransformDefinition } from './dictionary/entry-utils.js'
import {existWordRecord} from './vocabularyStore.js';
import { getWordParts as getWordPartsFromDict } from './word-parts-utils.js';
import {getOptionsFromCache } from './service/optionService.js';
import * as lemmatize from 'wink-lemmatizer';
import {dict as dictAffix} from './dicts/dict-affix.js';
import { addUnrecognizedWord } from './service/dictionaryService.js';
import { variableLengthStandardizeCharacters } from './text/textUtils.js';
import { getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
import { deepLookup } from './deep-lookup.js'
import { isRegularTransform } from './lemma.js'


var gPrefixes, gSuffixes;

function createDefaultSearchWordOptions(){
    return {
        allowLemma: true,
        lookupBase: 'Never',
        simplifyDefinition: {},
        dictionaryOptions: {},
        anonymous: true,
        autoJumping: false,       
    };
}

function patchSearchOptionDefaultValues(options){
    let defaultOptions = createDefaultSearchWordOptions();
    return Object.assign(defaultOptions, options);
}

function searchWord(query, options){
    if(!query){
        return;
    }
    query = query.trim();
    if(query.length == 0){
        return;
    }
    
    let result;
    
    //too long
    if(query.length > 45){
        return;
    }

    query = variableLengthStandardizeCharacters(query);

    //no alphabet at all
    if(query.match(/^[^a-zA-Z]+$/)){
        return result;
    }

    /*
    //non pure Enlgish
    if(query.match(/[^a-zA-Z\-\.']+/)){
        console.log(`non pure English word: ${query}`);
    }
    */

    //console.log(`search word: ${query}`);

    options = patchSearchOptionDefaultValues(options);

    if(!result) {        
        let dicts = getDicts(options);
        result = searchWordWithDict(query, options, dicts);
    }

    if(!result && !options.anonymous) {
        //console.log('word not in dictionary: '+options.query);
        addUnrecognizedWord(query);
    }

    return result;
}

function getDicts(options){
    
    let dicts = options.dicts;
    if(!dicts) {
        //console.log(`no dicts specified`);
        dicts = getEnabledDictionaryNamesFromCache();
    }

    if(options.dictionaryOptions){
        let dictionaryOptions = options.dictionaryOptions;
        for(let ad of dictionaryOptions.additionalDictionaries){
            if(ad && !dicts.includes(ad)){
                dicts.unshift(ad);
            }
        }        
    }
    
    return dicts;
}

function searchWordWithDict(query, options, dicts){
    //console.log('options:' + JSON.stringify(options)+', dicts:' + JSON.stringify(dicts));
    
    let input = query;
    let searchType = 'raw';
    let lemmaType = 'regular';
    //console.log('input:'+input);
    //replace single quotation mark
    input = input.replaceAll(/[’]/g, "'");
    
    //debug purpose
    if(input === 'man.') {
        //console.log(input);
    }

    let word = input;
    let lookupResult = lookup(word, options, dicts);
    
    let transformResult, deepLookupResult;

    //try lower case
    if(!lookupResult) {
        transformResult = transformLowercase(input, options, dicts);
        if(transformResult){
            word = transformResult.word;
            lookupResult = transformResult.lookupResult;
        }
    }

    //use lowercase word from here
    input = word;

    //try captialize, such god -> God
    if(!lookupResult && input.length > 1){
        transformResult = transformUppercaseFirstLetter(input, options, dicts);
        if(transformResult){
            word = transformResult.word;
            lookupResult = transformResult.lookupResult;
        }
    }

    let baseWord = '';
    let baseSearchType = '';

    if(!lookupResult) {
        if(options.allowLemma){
            transformResult = transformLemmatize(input, options, dicts);

            if(transformResult) {
                //create a result for the transform
                let entry = createEntryForLink(transformResult.word);
                lookupResult = {
                    query: input,
                    json: [entry],
                    dictionaryName: transformResult.lookupResult.dictionaryName
                };

                baseWord = transformResult.word;
                deepLookupResult = transformResult;

                searchType='lemma';
            }
        }
    }

    if(lookupResult) {
        if(options.transform){
            addTransformDefinition(lookupResult, options.transform);
        }

        if(!baseWord && options.lookupBase == 'WhenNecessary'){
            if(hasOnlyLinkOrFormDefinition(lookupResult.json)){
                deepLookupResult = deepLookup(lookupResult, options);

                if(deepLookupResult){
                    baseSearchType='lemma';
                    baseWord = deepLookupResult.word;
                }
            }
        }

        if(!baseWord && options.lookupBase == 'Always'){
            
            let baseWordResult = getBaseWordFromLinkOrDefinitionOrOption(lookupResult, options);
            
            if(baseWordResult){
                //console.log(baseWordResult);
                baseSearchType='lemma';
                baseWord = baseWordResult.word;
                deepLookupResult = baseWordResult;
            }

            if(!baseWordResult){
                let baseWordResult = getBaseWord(word, options, [lookupResult.dictionaryName]);
                
                if(baseWordResult){
                    //console.log(baseWordResult);
                    baseSearchType='lemma';
                    baseWord = baseWordResult.word;
                    deepLookupResult = baseWordResult;
                }
            }
        
        }

        if(!baseWord && options.lookupBase == 'Must'){
            
            let baseWordResult = getBaseWord(word, options, [lookupResult.dictionaryName]);
            
            if(baseWordResult){
                //console.log(baseWordResult);
                baseSearchType='lemma';
                baseWord = baseWordResult.word;
                deepLookupResult = baseWordResult;
            }
        
        }
    }

    //finally,
    if(lookupResult){// find the correct form which has definition in dictionary

        let definition = lookupResult.text;
        
        let result = {
            query : query,
            searchType: searchType,
            lemmaType: lemmaType,
            word: word,
            searchType: searchType,
            baseWord: baseWord,
            baseSearchType: baseSearchType,
            definition: definition,
            lookupResult: lookupResult,
            deepLookupResult: deepLookupResult,
        };

        //console.log('search result:'+JSON.stringify(result));
        return result;
    } else {
        //console.log('search result: none')
        return null;
    }
}

function transformLowercase(input, options, dicts){
    let word = input.toLowerCase();
    let lookupResult;
    if(word !== input){
        lookupResult = lookup(word, options, dicts);
    }

    if(lookupResult){
        return {
            word,
            lookupResult,
        }
    }
}

function transformUppercaseFirstLetter(input, options, dicts){
    let word = input[0].toUpperCase() + input.substring(1);
    let lookupResult;
    if(word !== input){
        lookupResult = lookup(word, options, dicts);
    }

    if(lookupResult){
        return {
            word,
            lookupResult,
        }
    }    
}

function transformLemmatize(input, options, dicts){
    let word;
    let lookupResult;
    
    //possessive, such as Jack's -> Jack
    if(!lookupResult) {
        word = getBaseFromPossessive(input);
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }
    }

    if(!lookupResult) {
        word = singularize(input);
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }
    }

    //word-parts dictionary has higher priority than lemmatize lib
    if(!lookupResult) {
        word = getBaseFromWordParts(input)
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }
    }

    if(!lookupResult) {
        word = lemmatize.adjective(input);
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }
    }

    if(!lookupResult) {
        word = lemmatize.noun(input);
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }                
    }

    if(!lookupResult) {
        word = lemmatize.verb(input);
        if(word !== input){
            lookupResult = lookup(word, options, dicts);
        }
    }

    let result = null;
    if(lookupResult) {
        result = {
            word,
            lookupResult,
        }
    }
    return result;
    
}

function getBaseWord(word, options, dicts){
    let baseWord;
    let lookupResult;
    
    if(!lookupResult) {
        baseWord = singularize(word);
        if(baseWord !== word){
            lookupResult = lookup(baseWord, options, dicts);
        }
    }

    //word-parts dictionary has higher priority than lemmatize lib
    if(!lookupResult) {
        baseWord = getBaseFromWordParts(word)
        if(baseWord !== word){
            lookupResult = lookup(baseWord, options, dicts);
        }
    }

    if(!lookupResult) {
        baseWord = lemmatize.noun(word);
        if(baseWord !== word){
            lookupResult = lookup(baseWord, options, dicts);
        }                
    }

    if(!lookupResult) {
        baseWord = lemmatize.verb(word);
        if(baseWord !== word){
            lookupResult = lookup(baseWord, options, dicts);
        }
    }

    let result = null;
    if(lookupResult) {
        result = {
            word: baseWord,
            lookupResult,
        }
    }
    return result;
    
}

function addTransformDefinition(lookupResult, transform){
    let existingTransformDefinitions = findDefinitionsByTypes(lookupResult.json, ['form', 'link']);
    if(existingTransformDefinitions.length>0){
        return;
    }

    let transformDefinition = createTransformDefinition(transform.type, transform.base);        
    let transformDefinitions = [ transformDefinition];
    let transformDefinitionGroup = { name: '', "definitions": transformDefinitions };  
    
    let entries = lookupResult.json;
    entries[0].definitionGroups.push(transformDefinitionGroup);
}

function getBaseWordFromLinkOrDefinitionOrOption(lookupResult, options){
    let baseLookupResult;
    let baseWord;

    if(!baseLookupResult){
        let definitions = findDefinitionsByTypes(lookupResult.json, ['form', 'link']);
        if(definitions.length > 0){
            let definition = definitions[0];

            let query;
            if(definition.type=='link'){
                query = definition.link;
            }else if(definition.type=='form'){
                query = definition.base;
            }

            baseLookupResult = lookup(query, options, [lookupResult.dictionaryName]);
            if(baseLookupResult){
                baseWord = query;
            }
        }
    }

    let result = null;
    if(baseLookupResult) {
        result = {
            word: baseWord,
            lookupResult: baseLookupResult,
        }
    }
    return result;
    
}

function isPrefix(s){    
    
    return getPrefixes().includes(s);    
}



function buildPrefixs(){
    let array = [];
    for(let affix in dictAffix){
        if(affix.endsWith('-')){
            array.push(affix.substring(0, affix.length-1));
        }
    }
    return array;
}

function getPrefixes(){
    if(!gPrefixes){
        gPrefixes = buildPrefixs();
    }
    return gPrefixes;
}

function buildSuffixs(){
    let array = [];
    for(let affix in dictAffix){
        if(affix.startsWith('-')){
            
            array.push(affix.substring(1));
        }
    }
    return array;
}

function getSuffixes(){
    if(!gSuffixes){
        gSuffixes = buildSuffixs();
    }
    return gSuffixes;
}

function removeSuffix(word){
    for(let suffix of getSuffixes()){
        if(word.endsWith(suffix)){
            let newWord = word.substring(0,word.length-suffix.length);
            return newWord;            
        }
    }
    return word;
}

function isSuffix(s){    
    //console.log('isSuffix:'+s);
    return getSuffixes().includes(s);
}

function getBaseFromWordParts(word){
    let parts = getWordPartsFromDict(word);
    if(parts){
        if(parts.length === 3 && parts[0] === '' && parts[1] !== '' && parts[2] !== ''){
            let base = parts[1];
            
            if(isRegularTransform(base, word)){
                return base;     
            }

        }
    }

    return word;
}

function getBaseFromPossessive(word){
    if(word.endsWith("'s")){
        return word.substring(0, word.length - 2);
    }else if(word.endsWith("'")){
        return word.substring(0, word.length - 1);
    }
    return word;
}

function singularize(word) {
    const endings = {
        ves: 'fe',
        ies: 'y',
        i: 'us',
        zes: 'ze',
        ses: 's',
        es: 'e',
        s: ''
    };
    return word.replace(
        new RegExp(`(${Object.keys(endings).join('|')})$`), 
        r => endings[r]
    );
}

function isKnown(baseWord, vocabulary){
    //console.log('isKnow:'+baseWord);
    const singleCharacterWordAsKnown = true;

    if(singleCharacterWordAsKnown){
        if(baseWord && baseWord.length==1){
            return true;
        }
    }
    
    //check if has unknown record
    let foundUnknownRecord = existWordRecord('#'+baseWord, vocabulary);
    if(foundUnknownRecord){
        return false;
    }

    let foundKnownRecord = existWordRecord(baseWord, vocabulary);
    if(foundKnownRecord){
        return true;
    }

    //root and affix mode
    let options = getOptionsFromCache();
    let rootAndAffixEnabled = options.rootAndAffix.enabled;
    if(rootAndAffixEnabled){
        let parts = getWordParts(baseWord);
        //console.log('get word parts:'+ baseWord);
        if(parts){
            if(parts.includes(baseWord)){
                console.warn('infinite revursive:'+ baseWord);
                return false;
            }

            let foundUnknownPart = false;
            for(let part of parts){
                let b = isKnown(part.dictEntry, vocabulary);
                if(!b){
                    foundUnknownPart = true;
                    break;
                }
            }
            
            if(!foundUnknownPart){
                return true;
            }
        }
    }
  
    return false;
}

function getWordParts(baseWord){
    let parts = getWordPartsFromDict(baseWord);

    if(!parts){
        //compouding
        if(baseWord.match(/\w+-\w+/)){
            parts =  baseWord.split('-');
        }        
    }

    if(!parts){
        return null;
    }

    let objArray = [];
        for(let part of parts){
            if(part){
                objArray.push({word:part, dictEntry: part, type:'root'});
            }
    }
    
    let first = objArray[0];
    if(first && isPrefix(first.word) && parts.length>1 ){
        first.type='prefix';
        first.dictEntry = first.word +'-';
    }

    let last = objArray[objArray.length-1];
    if(last && isSuffix(last.word) && parts.length>1){
        last.type='suffix';
        last.dictEntry = '-' + last.word;
    }

    //console.log('getWordParts:'+baseWord+':'+JSON.stringify(objArray));

    return objArray;
}

function buildDictionaryOptions(siteOptions){
    let options = getOptionsFromCache();
    
    let dictionaryOptions;
    if(options.dictionary.additionalDictionaryEnabled){
        dictionaryOptions = { additionalDictionaries: siteOptions.other.additionalDictionaries };
    } else {
        dictionaryOptions = { additionalDictionaries: [] };
    }
    return dictionaryOptions;
}
  
export {searchWord, isKnown, getWordParts, buildDictionaryOptions};