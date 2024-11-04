import {map as wordParts} from './word-parts.js';

function getWordParts(key){
    if(wordParts.hasOwnProperty(key)){
        return wordParts[key];
    } else {
        return null;
    }
}

export { getWordParts };