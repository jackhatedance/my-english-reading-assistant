'use strict';

import {lookup} from './dictionary.js';
import {existWordRecord} from './vocabularyStore.js';
import {map as wordParts} from './word-parts.js';
import {getOptionsFromCache} from './optionService.js';
import * as lemmatize from 'wink-lemmatizer';
import {dict as dictAffix} from './dict-affix.js';

var gPrefixes, gSuffixes;

function searchWord(request){

    let requestOfSmall = {...request};
    requestOfSmall.allowRemoveSuffixOrPrefix = false;
    
    let result = searchWordWithDict(requestOfSmall, ['small']);
    if(!result){
        result = searchWordWithDict(request, ['large']);
    }
    return result;
}

function searchWordWithDict(request, dicts){

    

    let input = request.query;
    let searchType = 'raw';
    let lemmaType = 'regular';


    //pre-process
    //replace u2018, u2109
    input = input.replace(/[\u2018-\u2019]/g,'\'');

    //no modification
    let word = input;
    let roots =null;
    let prefix=null;
    let suffix=null;
    let definition = lookup(word, dicts);

    let transformResult;

    //try lower case
    if(!definition) {
        transformResult = transformLowercase(input, dicts);
        word = transformResult.word;
        definition = transformResult.definition;
    }

    //use lowercase word from here
    input = word;

    //try captialize, such god -> God
    if(!definition && input.length > 1){
        word = input[0].toUpperCase() + input.substring(1);
        definition = lookup(word, dicts);
    }

    //lemma
    if(definition) {

        let result = definition.match('([a-zA-Z]+)的((过去式)|(过去分词)|(过去式和过去分词)|(现在分词)|(复数)|(名词复数))'); 
        
        //console.log('match result 1:'+result);   
        if(result != null && request.allowLemma){
            word = result[1];
            definition = lookup(word, dicts);

            searchType='lemma';
            lemmaType = 'irregular'
        }
    }

    if(!definition) {
        if(request.allowLemma){
            transformResult = transformLemmatize(input, dicts);

            word = transformResult.word;
            definition = transformResult.definition;

            searchType='lemma';
        }
    }

    //prefix, suffix, lemma
    if(!definition) {
        if(request.allowRemoveSuffixOrPrefix){
            if(!definition) {
                transformResult = transformRemoveSuffix(input, dicts);

                word = transformResult.word;
                definition = transformResult.definition;
            }
            if(!definition) {
                transformResult = transformRemovePrefix(input, dicts);

                word = transformResult.word;
                definition = transformResult.definition;
            }
            if(!definition) {
                word = removePrefix(input);
                word = removeSuffix(word);
                if(word.length > 2){
                    if(word!==input){
                        definition = lookup(word, dicts);
                    }
                    
                    //lemma
                    if(!definition){
                        transformResult = transformLemmatize(word, dicts);

                        word = transformResult.word;
                        definition = transformResult.definition; 
                    }
                }

            }
            searchType='removeSuffixOrPrefix';
        }
    }

    //finally,
    if(definition){// find the correct form which has definition in dictionary

        let result = {
            query : request.query,
            searchType: searchType,
            lemmaType: lemmaType,
            word: word,
            definition: definition,
        };

        //console.log('search result:'+JSON.stringify(result));
        return result;
    } else {
        //console.log('search result: none')
        return null;
    }
}

function transformLowercase(input, dicts){
    let word = input.toLowerCase();
    let definition;
    if(word !== input){
        definition = lookup(word, dicts);
    }
    return {
        word,
        definition,
    }
}

function transformLemmatize(input, dicts){
    let word;
    let definition;
    
    if(!definition) {
        word = singularize(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }
    }

    if(!definition) {
        word = lemmatize.adjective(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }
    }

    if(!definition) {
        word = lemmatize.noun(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }                
    }

    if(!definition) {
        word = lemmatize.verb(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }
    }

    return {
        word,
        definition,
    }
}

function transformRemovePrefix(input, dicts){
    let definition;
    let word = removePrefix(input);
    if(word.length > 2){
        if(word!==input){
            definition = lookup(word, dicts);
        }
    }

    return {
        word,
        definition,
    }
}


function transformRemoveSuffix(input, dicts){
    let definition;
    let word = removeSuffix(input);
    if(word.length > 2){
        if(word!==input){
            definition = lookup(word, dicts);
        }
    }
    return {
        word,
        definition,
    }
}

    function removePrefix(word){
        for(let prefix of getPrefixes()){
            if(word.startsWith(prefix)){
                let newWord = word.substring(prefix.length);
                return newWord;
            }
        }
        return word;
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


function getTargetWord(baseWord, roots, prefix, suffix, rootMode){

    let targetWord = baseWord;

    if(rootMode && roots) {

        let validPrefix = getPrefixes().includes(prefix);
        let validSuffix = getSuffixes().includes(suffix);

        let rootArray = roots.split(',');
      if(rootArray.length==1
        && validPrefix
        && validSuffix){
        targetWord = rootArray[0];
      }
      
    }
    return targetWord;
}

function isKnown(baseWord, vocabulary){
    //console.log('isKnow:'+baseWord);
    
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
        if(parts){
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
    let parts = wordParts[baseWord];
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
    if(first && isPrefix(first.word)){
        first.type='prefix';
        first.dictEntry = first.word +'-';
    }

    let last = objArray[objArray.length-1];
    if(last && isSuffix(last.word)){
        last.type='suffix';
        last.dictEntry = '-' + last.word;
    }

    //console.log('getWordParts:'+baseWord+':'+JSON.stringify(objArray));

    return objArray;
}
  
export {searchWord, isKnown, getWordParts};