'use strict';

import {lookup} from './dictionary.js';

import * as lemmatize from 'wink-lemmatizer';

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
  
export {searchWordBaseForm};