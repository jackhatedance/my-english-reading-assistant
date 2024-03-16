'use strict';

import {lookup} from './dictionary.js';

import * as lemmatize from 'wink-lemmatizer';
import {lancasterStemmer} from 'lancaster-stemmer'

function searchWordBaseForm(input){
    //no modification
    let word = input;
    let definition = lookup(word);

    //try lower case
    if(!definition) {
        word = input.toLowerCase();
        definition = lookup(word);
    }

    //let knife = lemmatize.noun('knivest');
    //console.log('knives:'+knife);

    
    if(!definition) {
        word = lemmatize.adjective(input);
        definition = lookup(word);
    }

    if(!definition) {
        word = lemmatize.noun(input);
        definition = lookup(word);
    }

    if(!definition) {
        word = lemmatize.verb(input);
        definition = lookup(word);
    }
    


    //finally,
    if(definition){// find the correct form which has definition in dictionary
        return word;
    } else {
        return null;
    }
}


function searchWord(request){

    let input = request.query;
    let searchType = 'raw';
    let lemmaType = 'regular';

    //no modification
    let word = input;
    let definition = lookup(word);

    let transformResult;

    //try lower case
    if(!definition) {
        transformResult = transformLowercase(input);
        word = transformResult.word;
        definition = transformResult.definition;
    }

    //use lowercase word from here
    input = word;

    //lemma
    if(definition && definition.includes('的过去式')) {
        let index = definition.includes('的过去式');

        if(request.allowLemma){
            word = definition.substring(0, index);
            definition = lookup(word);

            searchType='lemma';
            lemmaType = 'irregular'
        }
    }

    if(!definition) {
        if(request.allowLemma){
            transformResult = transformLemmatize(input);

            word = transformResult.word;
            definition = transformResult.definition;

            searchType='lemma';
        }
    }

    //prefix, suffix, lemma
    if(!definition) {
        if(request.allowRemoveSuffixOrPrefix){
            if(!definition) {
                transformResult = transformRemoveSuffix(input);

                word = transformResult.word;
                definition = transformResult.definition;
            }
            if(!definition) {
                transformResult = transformRemovePrefix(input);

                word = transformResult.word;
                definition = transformResult.definition;
            }
            if(!definition) {
                word = removePrefix(input);
                word = removeSuffix(word);
                if(word.length > 2){
                    if(word!==input){
                        definition = lookup(word);
                    }
                    
                    //lemma
                    if(!definition){
                        transformResult = transformLemmatize(word);

                        word = transformResult.word;
                        definition = transformResult.definition; 
                    }
                }

            }
            searchType='removeSuffixOrPrefix';
        }
    }

    if(!definition) {
        if(request.allowStem){
        /*    
            
            if(!definition) {
                //word = porterStemmer( input );
                
                word = lancasterStemmer(input);

                console.log('query:'+input+',stem:'+word);
                definition = lookup(word);
                searchType='stem';
            }
            */
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

function transformLowercase(input){
    let word = input.toLowerCase();
    let definition;
    if(word !== input){
        definition = lookup(word);
    }
    return {
        word,
        definition,
    }
}

function transformLemmatize(input){
    let word;
    let definition;
    
    if(!definition) {
        word = singularize(input);
        if(word !== input){
            definition = lookup(word);
        }
    }

    if(!definition) {
        word = lemmatize.adjective(input);
        if(word !== input){
            definition = lookup(word);
        }
    }

    if(!definition) {
        word = lemmatize.noun(input);
        if(word !== input){
            definition = lookup(word);
        }                
    }

    if(!definition) {
        word = lemmatize.verb(input);
        if(word !== input){
            definition = lookup(word);
        }
    }

    return {
        word,
        definition,
    }
}

function transformRemovePrefix(input){
    let definition;
    let word = removePrefix(input);
    if(word.length > 2){
        if(word!==input){
            definition = lookup(word);
        }
    }

    return {
        word,
        definition,
    }
}


function transformRemoveSuffix(input){
    let definition;
    let word = removeSuffix(input);
    if(word.length > 2){
        if(word!==input){
            definition = lookup(word);
        }
    }
    return {
        word,
        definition,
    }
}

const prefixes = [
    "anti",
    "auto",
    "de",
    "dis",
    "down",
    "extra",
    "hyper",
    "il",
    "im",
    "in",
    "ir",
    "inter",
    "mega",
    "mid",
    "mis",
    "non",
    "over",
    "out",
    "post",
    "pre",
    "pro",
    "re",
    "semi",
    "sub",
    "super",
    "tele",
    "trans",
    "ultra",
    "un",
    "under",
    "up",
   
    ];
    function removePrefix(word){
        for(let prefix of prefixes){
            if(word.startsWith(prefix)){
                let newWord = word.substring(prefix.length);
                return newWord;
            }
        }
        return word;
    }

const suffixes = [

"age",
"al",
"ance",
"ence",
"dom",
"ee",
"er",
"or",
"hood",
"ism",
"ist",
"ity",
"ty",
"ment",
"ness",
"ry",
"ship",
"sion",
"tion",
"xion",

"able",
"ible",
"al",
"en",
"ese",
"ful",
"i",
"ic",
"ish",
"ive",
"ian",
"less",
"ly",
"ous",
"y",
"ate",
"en",
"fly",
"ise",
"ize",

"ly",
"ward",
"wise",

];
function removeSuffix(word){
    for(let suffix of suffixes){
        if(word.endsWith(suffix)){
            let newWord = word.substring(0,word.length-suffix.length);
            return newWord;            
        }
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
  
export {searchWord};