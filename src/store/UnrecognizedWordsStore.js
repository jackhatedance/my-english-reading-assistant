import {chunkedRead, chunkedWrite} from '../chunk.js';

const KEY = 'unrecognizedWords';

async function loadUnrecognizedWords(){
    
    let result=  await chunkedRead(KEY);
    //console.log('load unrecognized words:'+ JSON.stringify(result));
    return result;
}

async function saveUnrecognizedWords(data){
    //console.log('save unrecognized words:'+ JSON.stringify(data));
    return  await chunkedWrite(KEY, data);
}

export {loadUnrecognizedWords, saveUnrecognizedWords };