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
        let filename = 'wordlists/'+listname + '.txt';
        let wordList = await loadWordList(filename);

        for(let word of wordList){
            wordSet.add(word);
        }
    }
    let mergedWordArray = Array.from(wordSet);
    return mergedWordArray;
}

function loadWordList(filename){
    const errorHandler = function (e) {
        console.log(e);
    };

    return new Promise((resolve, reject) => {
        chrome.runtime.getPackageDirectoryEntry(function(root) {
            root.getFile(filename, {}, function(fileEntry) {
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

async function addKnownWord(knownWord){
    //console.log('add word:'+ knownWord);

    //add into knownWords
    let knownWords = await loadKnownWords();
    const knownWordSet = new Set(knownWords);
    knownWordSet.add(knownWord);
    knownWords = Array.from(knownWordSet);

    await saveKnownWords(knownWords);

}

async function removeKnownWord(knownWord){
    //console.log('remove word:'+ knownWord);

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

export {loadKnownWords, loadDefaultKnownWords, loadAndMergeWordLists, saveKnownWords, addKnownWord, removeKnownWord, isKnown};