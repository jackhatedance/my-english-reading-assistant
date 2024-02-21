import {lookup} from './dictionary.js';


function searchWordBaseForm(input){
    //no modification
    let word = input;
    let definition = lookup(word);

    //try lower case
    if(!definition) {
        word = input.toLowerCase();
        definition = lookup(word);
    }

    //try singular
    if(!definition) {
        word = singularize(input);
        definition = lookup(word);
    }

    //try another tense


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