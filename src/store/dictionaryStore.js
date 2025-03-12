import {chunkedRead, chunkedWrite, chunkedDelete} from '../chunk.js';

const KEY_DICTIONARIES = 'dictionaries';
async function loadDictionaryMetas(){
    
    let result = await chrome.storage.local.get([KEY_DICTIONARIES]);
    return result[KEY_DICTIONARIES];
}

async function saveDictionaryMetas(dictionaries){
    let object = { };
    object[KEY_DICTIONARIES] = dictionaries;
    
    await chrome.storage.local.set(object);
}

async function loadDictionaryData(name){
    let chunkKey = getChunkKey(name);
    let entries = await chunkedRead(chunkKey);
    if(!entries){
        entries = [];
    }
    return entries;
}

async function saveDictionaryData(name, data){
    let chunkKey = getChunkKey(name);
    return  await chunkedWrite(chunkKey, data);
}

async function deleteDictionaryData(name){
    let chunkKey = getChunkKey(name);
    return  await chunkedDelete(chunkKey);
}

function getChunkKey(name){
    return 'dictionary-' + name;
}

export {loadDictionaryData, saveDictionaryData, deleteDictionaryData, loadDictionaryMetas, saveDictionaryMetas };