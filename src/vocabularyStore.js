import {chunkedRead, chunkedWrite} from './chunk.js';

async function loadKnownWords(){
    return  await chunkedRead('knownWords');
}

async function saveKnownWords(data){
    return  await chunkedWrite('knownWords', data);
}

async function addKnownWord(knownWord){

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


async function isKnown(word) {
    
    let knownWords = await loadKnownWords();
    

    let baseForm = word;
    let found = knownWords.indexOf(baseForm) >= 0;
    if(!found){
      let lowercaseWord = word.toLowerCase();
      found = knownWords.indexOf(lowercaseWord) >= 0;
    }
  
    return found;
  }

export {loadKnownWords, saveKnownWords, addKnownWord, removeKnownWord, isKnown};