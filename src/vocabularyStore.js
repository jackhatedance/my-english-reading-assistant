import {chunkedRead, chunkedWrite} from './chunk.js';

async function loadKnownWords(){
    return  await chunkedRead('knownWords');
}

async function loadUnknownWords(){
    return  await chunkedRead('unknownWords');
}

async function saveKnownWords(data){
    return  await chunkedWrite('knownWords', data);
}

async function saveUnknownWords(data){
    return  await chunkedWrite('unknownWords', data);
}

async function addKnownWord(knownWord){
    
    //remove from unknownWords
    let unknownWords = await loadUnknownWords();
    const unknownWordSet = new Set(unknownWords);
    unknownWordSet.delete(knownWord);
    unknownWords = Array.from(unknownWordSet);

    await saveUnknownWords(unknownWords);


    //add into knownWords
    let knownWords = await loadKnownWords();
    const knownWordSet = new Set(knownWords);
    knownWordSet.add(knownWord);
    knownWords = Array.from(knownWordSet);

    await saveKnownWords(knownWords);

}

async function removeKnownWord(knownWord){
    
    //remove from knownWords
    let knownWords = await loadKnownWords();
    const knownWordSet = new Set(knownWords);
    knownWordSet.delete(knownWord);
    knownWords = Array.from(knownWordSet);

    await saveKnownWords(knownWords);

}
export {loadKnownWords, loadUnknownWords, saveKnownWords, saveUnknownWords, addKnownWord, removeKnownWord};