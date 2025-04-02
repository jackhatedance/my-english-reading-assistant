import {chunkedRead, chunkedWrite, chunkedDelete} from '../chunk.js';

const KEY_DICTIONARIES = 'dictionaries';
const TYPE_RAW = 'raw';
const TYPE_INDEX = 'index';
const TYPE_EXTRACTED_RAW_DIR = 'extracted_raw_dir';
const TYPE_EXTRACTED_RAW_FILE = 'extracted_raw_file';
const TYPE_EXTRACTED_RESOURCE_DIR = 'extracted_resource_dir';
const TYPE_EXTRACTED_RESOURCE_FILE = 'extracted_resource_file';

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

async function loadAllDictionaryExtractedRawData(name){
    let dir = await loadDictionaryExtractedRawDir(name);
    let fileMap = {};
    for(let fileName of dir){
        let data = await loadDictionaryExtractedRawData(name, fileName);
        fileMap[fileName] = data;
    }
    
    return fileMap;
}

async function loadDictionaryExtractedRawData(name, fileName){
    let chunkKey = getExtractedRawFileKey(name, fileName);
    return await chunkedRead(chunkKey);    
}

async function loadDictionaryExtractedResourceData(name, fileName){
    let chunkKey = getExtractedResourceFileKey(name, fileName);
    return await chunkedRead(chunkKey);    
}

async function saveDictionaryExtractedData(name, extractedData){
    await saveDictionaryExtractedRawData(name, extractedData.raw);
    await saveDictionaryExtractedResourceData(name, extractedData.resource);
}

function getExtractedRawFileKey(dictionaryName, fileName){ 
    return getChunkKey(dictionaryName, TYPE_EXTRACTED_RAW_FILE, fileName);
}

function getExtractedResourceFileKey(dictionaryName, fileName){ 
    return getChunkKey(dictionaryName, TYPE_EXTRACTED_RESOURCE_FILE, fileName);
}

async function saveDictionaryExtractedRawData(name, extractedRawData){
    const fileMap = extractedRawData;
    
    let dir = [];
    for (const [key, value] of Object.entries(fileMap)) {
        dir.push(key);
        let chunkKey = getExtractedRawFileKey(name, key);
        await chunkedWrite(chunkKey, value);
    }
    
    let chunkKey = getDictionaryExtractedRawDirKey(name);
    await chunkedWrite(chunkKey, dir);
}

function getDictionaryExtractedRawDirKey(name){
    return getChunkKey(name, TYPE_EXTRACTED_RAW_DIR);
}

async function loadDictionaryExtractedRawDir(name){
    let chunkKey = getDictionaryExtractedRawDirKey(name);
    return await chunkedRead(chunkKey);    
}

async function saveDictionaryExtractedResourceData(name, extractedResourceData){
    const fileMap = extractedResourceData;
    
    let dir = [];
    for (const [key, value] of Object.entries(fileMap)) {
        dir.push(key);
        let chunkKey = getExtractedResourceFileKey(name, key);
        await chunkedWrite(chunkKey, value);
    }

    let chunkKey = getDictionaryExtractedResourceDirKey(name);
    await chunkedWrite(chunkKey, dir);
}

function getDictionaryExtractedResourceDirKey(name){
    return getChunkKey(name, TYPE_EXTRACTED_RESOURCE_DIR);
}

async function loadDictionaryExtractResourceDir(name){
    let chunkKey = getDictionaryExtractedResourceDirKey(name);
    return await chunkedRead(chunkKey);
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

function getChunkKey(name, type, type2){
    if(type2){
        return `dictionary-${name}-${type}-${type2}`;
    } else {
        return `dictionary-${name}-${type}`;
    }    
}


export {loadDictionaryData, loadDictionaryRawData, loadDictionaryIndexData, saveDictionaryData, saveDictionaryIndexData, saveDictionaryExtractedData, loadDictionaryExtractedRawDir, loadDictionaryExtractResourceDir, loadAllDictionaryExtractedRawData, loadDictionaryExtractedRawData, loadDictionaryExtractedResourceData, deleteDictionaryData, deleteDictionaryIndexData, loadDictionaryMetas, saveDictionaryMetas };