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

    if(request.allowLemma){
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
        searchType='lemma';
    }
    
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

    //finally,
    if(definition){// find the correct form which has definition in dictionary

        let result = {
            query : request.query,
            searchType: searchType,
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