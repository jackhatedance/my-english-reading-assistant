'use strict';

import {lookup, simplifyDefinition, splitWordClasses, parseWordClass, splitWordMeanings} from './dictionary.js';
import {existWordRecord} from './vocabularyStore.js';
import {map as wordParts} from './word-parts.js';
import {getOptionsFromCache} from './service/optionService.js';
import * as lemmatize from 'wink-lemmatizer';
import {dict as dictAffix} from './dicts/dict-affix.js';

var gPrefixes, gSuffixes;

function searchWord(request){
    let result;

    let isEndWithDot = endsWithDot(request.query);
    if(isEndWithDot) {
        result = searchWordEndsWithDot(request);
    }
    
    if(!result) {
        result = searchWordBase(request);
    }

    return result;
}

function searchWordEndsWithDot(request){
    let result = null;

    if(request.allowRemoveEndingDot){
        let oldQuery = request.query; 
        let newQuery = oldQuery.slice(0, -1); 

        request.query = newQuery;
        result = searchWordBase(request);
        if(!result){//restore
            request.query = oldQuery;
        }
    }
    
    return result;
}

function endsWithDot(text){
    var result = false;
    if(text){
        if(text.match(/.+[.]/)){
            result = true;
        }
    }
    return result;
}

function searchWordBase(request){
    
    let requestOfDefault = {...request};
    requestOfDefault.allowRemoveSuffixOrPrefix = false;
    let dicts = request.dicts;
    if(!dicts) {
        dicts = ['small', 'affix'];
    }
    
    let result = searchWordWithDict(requestOfDefault, dicts);
    if(!result && !dicts.includes('large')){
        result = searchWordWithDict(request, ['large']);
    }

    if(!result){
        let isCompounding = request.query.match(/[a-zA-Z]+-[a-zA-Z]+/);
        if(isCompounding && request.allowCompounding){
            result = searchCompounding(request, ['large']);    
        }        
    }

    return result;
}


function searchCompounding(request, dicts){
    let query = request.query;

    let wordParts = query.split('-');
  
    let definitions = [];
    
    let requestOfSubword = {...request};
    for(let subword of wordParts){
        requestOfSubword.query = subword;
        let searchResult = searchWordWithDict(requestOfSubword, dicts);
  
        if(searchResult) {
            let str = `${subword}:${searchResult.definition}`;
            definitions.push(str);      
        }        
    }
  
    let searchResult = {
      query: query,
      searchType: 'compounding',
      lemmaType: null,
      word: query,
      definition: definitions.join(';'),
    };
    return searchResult;
  }

function searchWordWithDict(request, dicts){
    //console.log('dicts:' + JSON.stringify(dicts));
    
    let input = request.query;
    let searchType = 'raw';
    let lemmaType = 'regular';
    //console.log('input:'+input);
    //replace single quotation mark
    input = input.replaceAll(/[’]/g, "'");
    
    //debug purpose
    if(input === 'man.') {
        console.log(input);
    }

    let word = input;
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


    if(!definition) {
        if(request.allowLemma){
            transformResult = transformLemmatize(input, dicts);

            word = transformResult.word;
            definition = transformResult.definition;

            searchType='lemma';
        }
    }

    if(definition) {
        
        //lemma
        if(request.allowLemma){
            let done = false;

            let result = definition.match('^([a-zA-Z]+)的((过去式)|(过去分词)|(过去式和过去分词)|(现在分词))'); 
            
            //console.log('match result 1:'+result);   
            if(result != null){
                word = result[1];
                definition = lookup(word, dicts);
                
                lemmaType = 'irregular';
                done = true;

            }

            if(!done){
                
                let result = definition.match('([a-zA-Z]+) ?的((复数)|(名词复数))');
                if(result != null){
                    word = result[1];
                    let def = lookup(word, dicts);
                    if(definition.includes(def)){
                        definition = def;

                        lemmaType = 'plural';
                        done = true;
                    }
                }
            }

            if(!done){
                let wordClasses = splitWordClasses(definition);
                if(wordClasses.length === 1) {
                    let wordClassResult = parseWordClass(wordClasses[0]);
                    let meanings = splitWordMeanings(wordClassResult.meanings);
                    if(meanings.length === 1) {
                        let result = meanings[0].match('^([a-zA-Z]+)的((变形))');
                        if(result != null){
                            word = result[1];
                            let def = lookup(word, dicts);
                            if(def){
                                definition = def;

                                lemmaType = 'morph';
                                done = true;
                            }
                        }
                    }
                }
            }

            if(!done){
                if(definition.startsWith('pl\.')){
                    transformResult = transformLemmatize(input, dicts);
                    
                    //found base form
                    if(transformResult.word){
                        word = transformResult.word;
                        definition = transformResult.definition;
                        
                        lemmaType = 'plural';
                        done = true;
                    }
                }
            }

            if(done){
                searchType='lemma';
            }
        
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

        let shortDefinition = definition;
        if(request.simplifyDefinition){
            shortDefinition = simplifyDefinition(definition, request.simplifyDefinition);
        }

        let result = {
            query : request.query,
            searchType: searchType,
            lemmaType: lemmaType,
            word: word,
            definition: definition,
            shortDefinition: shortDefinition,
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
    
    //possessive, such as Jack's -> Jack
    if(!definition) {
        word = getBaseFromPossessive(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }
    }

    if(!definition) {
        word = singularize(input);
        if(word !== input){
            definition = lookup(word, dicts);
        }
    }

    //word-parts dictionary has higher priority than lemmatize lib
    if(!definition) {
        word = getBaseFromWordParts(input)
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

function getBaseFromWordParts(word){
    let parts = wordParts[word];
    if(parts){
        if(parts.length === 3 && parts[0] === '' && parts[1] !== '' && parts[2] !== ''){
            let base = parts[1];
            let suffix = parts[2];

            let lastChar = base.charAt(base.length - 1);

            if(suffix === 'ed' || suffix === 'd' || suffix === lastChar + 'ed'
                //|| suffix === 's' || suffix === 'es'
             ) {
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
        //console.log('get word parts:'+ baseWord);
        if(parts){
            if(parts.includes(baseWord)){
                console.log('infinite revursive:'+ baseWord);
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
    let parts = wordParts[baseWord];

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
  
export {searchWord, isKnown, getWordParts};