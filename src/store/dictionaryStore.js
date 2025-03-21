import {chunkedRead, chunkedWrite, chunkedDelete} from '../chunk.js';

const KEY_DICTIONARIES = 'dictionaries';
const TYPE_RAW = 'raw';
const TYPE_INDEX = 'index';

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
    let raw = await loadDictionaryRawData(name);
    let index = await loadDictionaryIndexData(name);
    return {raw, index};
}

async function loadDictionaryRawData(name){
    let chunkKeyOfRaw = getChunkKey(name, TYPE_RAW);
    let raw = await chunkedRead(chunkKeyOfRaw);
    return raw;
}

async function loadDictionaryIndexData(name){
    let chunkKeyOfMap = getChunkKey(name, TYPE_INDEX);
    let index = await chunkedRead(chunkKeyOfMap);
    
    return index;
}

async function saveDictionaryData(name, data){
    await saveDictionaryRawData(name, data.raw);
    
    //optional
    if(data.index) {
        await saveDictionaryIndexData(name, data.index);
    }    
}

async function saveDictionaryRawData(name, rawData){
    let chunkKeyOfRaw = getChunkKey(name, TYPE_RAW);
    await chunkedWrite(chunkKeyOfRaw, rawData);
}

async function saveDictionaryIndexData(name, indexData){
    let chunkKey = getChunkKey(name, TYPE_INDEX);
    await chunkedWrite(chunkKey, indexData);    
}

async function deleteDictionaryData(name){
    await deleteDictionaryRawData(name);

    await deleteDictionaryIndexData(name);
}

async function deleteDictionaryRawData(name){
    let chunkKeyOfRaw = getChunkKey(name, TYPE_RAW);    
    await chunkedDelete(chunkKeyOfRaw);
}

async function deleteDictionaryIndexData(name){
    let chunkKeyOfIndex = getChunkKey(name, TYPE_INDEX);    
    await chunkedDelete(chunkKeyOfIndex);
}

function getChunkKey(name, type){
    return `dictionary-${name}-${type}`;
}


export {loadDictionaryData, loadDictionaryRawData, loadDictionaryIndexData, saveDictionaryData, saveDictionaryIndexData, deleteDictionaryData, deleteDictionaryIndexData, loadDictionaryMetas, saveDictionaryMetas };