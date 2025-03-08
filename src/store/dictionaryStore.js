import {chunkedRead, chunkedWrite, chunkedDelete} from '../chunk.js';

async function loadDictionary(name){
    let chunkKey = getChunkKey(name);
    let entries = await chunkedRead(chunkKey);
    if(!entries){
        entries = [];
    }
    return entries;
}

async function saveDictionary(name, data){
    let chunkKey = getChunkKey(name);
    return  await chunkedWrite(chunkKey, data);
}

async function deleteDictionary(name){
    let chunkKey = getChunkKey(name);
    return  await chunkedDelete(chunkKey);
}

function getChunkKey(name){
    return 'dictionary-' + name;
}

export {loadDictionary, saveDictionary, deleteDictionary };