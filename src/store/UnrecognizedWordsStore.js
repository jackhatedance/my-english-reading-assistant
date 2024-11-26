import {chunkedRead, chunkedWrite} from '../chunk.js';

const KEY = 'unrecognizedWords';

async function loadUnrecognizedWords(){
    return  await chunkedRead(KEY);
}

async function saveUnrecognizedWords(data){
    return  await chunkedWrite(KEY, data);
}

export {loadUnrecognizedWords, saveUnrecognizedWords };