import {chunkedRead, chunkedWrite, chunkedDelete} from '../chunk.js';
import { Progress } from '../dictionary/Progress.js'

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
    await saveDictionaryRawDataAsSinglePiece(name, rawData);
    await saveDictionaryExtractedRawData(name, rawData);
}

async function saveDictionaryRawDataAsSinglePiece(name, rawData){
    let chunkKeyOfRaw = getChunkKey(name, TYPE_RAW);
    await chunkedWrite(chunkKeyOfRaw, rawData);
}

async function saveDictionaryIndexData(name, indexData){
    let chunkKey = getChunkKey(name, TYPE_INDEX);
    await chunkedWrite(chunkKey, indexData);    
}

async function loadAllDictionaryExtractedRawData(name, extensions){
    let dir = await loadDictionaryExtractedRawDir(name);
    let fileMap = {};
    for(let fileName of dir){
        let matchExtension = extensions.find(item => fileName.endsWith(item));
        if(matchExtension){
            let data = await loadDictionaryExtractedRawFile(name, fileName);
            fileMap[fileName] = data;
        }
    }
    
    return fileMap;
}

async function findDictionaryExtractedRawFile(name, fileName){
    let dir = await loadDictionaryExtractedRawDir(name);
    for(let fullFileName of dir){
        if(fullFileName.includes(fileName)){
            let data = await loadDictionaryExtractedRawFile(name, fullFileName);
            return data;        
        }
    }    
}

async function loadDictionaryExtractedRawFile(name, fileName){
    let chunkKey = getExtractedRawFileKey(name, fileName);
    return await chunkedRead(chunkKey);    
}

async function deleteDictionaryExtractedRawFile(name, fileName){
    let chunkKey = getExtractedRawFileKey(name, fileName);
    return await chunkedDelete(chunkKey);    
}

async function loadDictionaryExtractedResourceFile(name, fileName){
    let chunkKey = getExtractedResourceFileKey(name, fileName);
    return await chunkedRead(chunkKey);    
}

async function deleteDictionaryExtractedResourceFile(name, fileName){
    let chunkKey = getExtractedResourceFileKey(name, fileName);
    return await chunkedDelete(chunkKey);    
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

async function deleteDictionaryExtractedRawData(name){
    let dir = await loadDictionaryExtractedRawDir(name);
    if(dir){    
        for(let fileName of dir){
            await deleteDictionaryExtractedRawFile(name, fileName);    
        }    
        await deleteDictionaryExtractedRawDir(name);
    }
}

function getDictionaryExtractedRawDirKey(name){
    return getChunkKey(name, TYPE_EXTRACTED_RAW_DIR);
}

async function loadDictionaryExtractedRawDir(name){
    let chunkKey = getDictionaryExtractedRawDirKey(name);
    return await chunkedRead(chunkKey);    
}

async function deleteDictionaryExtractedRawDir(name){
    let chunkKey = getDictionaryExtractedRawDirKey(name);
    return await chunkedDelete(chunkKey);    
}

async function saveDictionaryExtractedResourceData(name, extractedResourceData, updateProgress){
    const fileMap = extractedResourceData;
    
    let entries = Object.entries(fileMap);
    let total = entries.length;
    let progress = new Progress('save extracted files', total, updateProgress);
    progress.start();

    let dir = [];
    for (const [key, value] of entries) {
        dir.push(key);
        let chunkKey = getExtractedResourceFileKey(name, key);
        await chunkedWrite(chunkKey, value);

        await progress.count();
    }

    let chunkKey = getDictionaryExtractedResourceDirKey(name);
    await chunkedWrite(chunkKey, dir);
}

async function deleteDictionaryExtractedResourceData(name){
    let dir = await loadDictionaryExtractResourceDir(name);
    if(dir){
        for(let fileName of dir){
            await deleteDictionaryExtractedResourceFile(name, fileName);
        }   
        await deleteDictionaryExtractedResourceDir(name);
    }
}

function getDictionaryExtractedResourceDirKey(name){
    return getChunkKey(name, TYPE_EXTRACTED_RESOURCE_DIR);
}

async function loadDictionaryExtractResourceDir(name){
    let chunkKey = getDictionaryExtractedResourceDirKey(name);
    return await chunkedRead(chunkKey);
}

async function deleteDictionaryExtractedResourceDir(name){
    let chunkKey = getDictionaryExtractedResourceDirKey(name);
    return await chunkedDelete(chunkKey);
}

async function deleteDictionaryData(name){
    await deleteDictionaryRawData(name);

    await deleteDictionaryIndexData(name);

    await deleteDictionaryExtractedData(name);
}

async function deleteDictionaryRawData(name){
    let chunkKeyOfRaw = getChunkKey(name, TYPE_RAW);    
    await chunkedDelete(chunkKeyOfRaw);
}

async function deleteDictionaryIndexData(name){
    let chunkKeyOfIndex = getChunkKey(name, TYPE_INDEX);    
    await chunkedDelete(chunkKeyOfIndex);
}

async function deleteDictionaryExtractedData(name){
    await deleteDictionaryExtractedRawData(name);
    await deleteDictionaryExtractedResourceData(name);
}

function getChunkKey(name, type, type2){
    if(type2){
        return `dictionary-${name}-${type}-${type2}`;
    } else {
        return `dictionary-${name}-${type}`;
    }    
}


export {loadDictionaryData, loadDictionaryRawData, loadDictionaryIndexData, saveDictionaryData, saveDictionaryIndexData, saveDictionaryExtractedResourceData, loadDictionaryExtractedRawDir, loadDictionaryExtractResourceDir, loadAllDictionaryExtractedRawData, findDictionaryExtractedRawFile, loadDictionaryExtractedRawFile, loadDictionaryExtractedResourceFile, deleteDictionaryData, deleteDictionaryIndexData, loadDictionaryMetas, saveDictionaryMetas };