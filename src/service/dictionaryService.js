'use strict';

import {loadUnrecognizedWords, saveUnrecognizedWords} from '../store/UnrecognizedWordsStore.js';

var gEnabled = false;
var gUnrecogizedWordsSet = new Set();

function initializeDictionaryService(enabled){
    gEnabled = enabled;
}

//add to memory set
function addUnrecognizedWord(word){
    if(!gEnabled){
        return;
    }

    gUnrecogizedWordsSet.add(word);    
}

//write words to store
async function flushUnrecognizedWords(){
    if(!gEnabled){
        return;
    }

    let words = await loadUnrecognizedWords();
    if(!words){
        words = [];
    }

    let mergedSet = new Set();
    for(let word of words){
        mergedSet.add(word);
    }    

    for(let word of gUnrecogizedWordsSet) {
        mergedSet.add(word);
    }
    
    let mergedWords = Array.from(mergedSet);
    
    await saveUnrecognizedWords(mergedWords);

    //clear memory set
    gUnrecogizedWordsSet.clear();
}

async function getUnrecognizedWords(){
    let words = await loadUnrecognizedWords();
    if(!words){
        words = [];
    }
    return words;
}

//both memory set and store
async function clearUnrecognizedWords(){
    gUnrecogizedWordsSet.clear();

    let words = [];
    await saveUnrecognizedWords(words);
}


export { initializeDictionaryService, addUnrecognizedWord, flushUnrecognizedWords, getUnrecognizedWords, clearUnrecognizedWords};