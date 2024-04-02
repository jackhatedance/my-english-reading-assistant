import {chunkedRead, chunkedWrite} from './chunk.js';

async function loadKnownWords(){
    return  await chunkedRead('knownWords');
}

function loadDefaultKnownWords(){
    return loadWordList("常用-8000.txt");
}

async function loadAndMergeWordLists(listnames){
    let wordSet = new Set();
    for(let listname of listnames){
        let filename = listname + '.txt';
        let wordList = await loadWordList(filename);

        for(let word of wordList){
            wordSet.add(word);
        }
    }
    let mergedWordArray = Array.from(wordSet);
    return mergedWordArray;
}

function loadWordList(filename){
    //console.log('loadWordList:'+filename)
    const errorHandler = function (e) {
        console.log(e);
    };

    return new Promise((resolve, reject) => {
        chrome.runtime.getPackageDirectoryEntry(function(root) {
            root.getFile('wordlists/' + filename, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        let text = this.result;
                        //console.log(text);
                        //return text;
                        resolve(text.split('\n'));
                    };
                    reader.readAsText(file);                
                }, errorHandler);
            }, errorHandler);
        });
    });
}

async function saveKnownWords(data){
    return  await chunkedWrite('knownWords', data);
}

async function markWordAsKnown(word){
    //console.log('mark word as known:'+ word);

    //add into knownWords
    let knownWords = await loadKnownWords();
    let count0 = calculateKnownWordsCount(knownWords);

    const knownWordSet = new Set(knownWords);
    knownWordSet.add(word);
    knownWordSet.delete('#'+word);
    knownWords = Array.from(knownWordSet);

    let count1 = calculateKnownWordsCount(knownWords);

    await saveKnownWords(knownWords);

    return count1 - count0;
}

async function markWordAsUnknown(word){
    //console.log('mark word as unknown :'+ word);

    //remove from knownWords
    let knownWords = await loadKnownWords();

    let count0 = calculateKnownWordsCount(knownWords);

    const knownWordSet = new Set(knownWords);
    knownWordSet.delete(word);
    knownWordSet.add('#'+word);
    knownWords = Array.from(knownWordSet);

    let count1 = calculateKnownWordsCount(knownWords);

    await saveKnownWords(knownWords);

    return count1 - count0;
}

async function removeWordMark(word){
    //console.log('mark word as unknown :'+ word);

    //remove from knownWords
    let knownWords = await loadKnownWords();
    let count0 = calculateKnownWordsCount(knownWords);

    const knownWordSet = new Set(knownWords);
    knownWordSet.delete(word);
    knownWordSet.delete('#'+word);
    knownWords = Array.from(knownWordSet);

    let count1 = calculateKnownWordsCount(knownWords);

    await saveKnownWords(knownWords);
    return count1 - count0;
}

function calculateKnownWordsCount(wordArray) {
    return wordArray.filter((w) => !w.startsWith('#')).length;  
}

function existWordRecord(key, vocabulary){
    
    if(!vocabulary){
        vocabulary = loadKnownWords();
    }
    
    let found = vocabulary.indexOf(key) >= 0;
    if(!found){
      let lowercaseWord = key.toLowerCase();
      found = vocabulary.indexOf(lowercaseWord) >= 0;
    }
    //console.log('existWordRecord:'+key+', found:'+found);
    return found;
}



export {loadKnownWords, loadDefaultKnownWords, loadAndMergeWordLists, saveKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark, existWordRecord, calculateKnownWordsCount};