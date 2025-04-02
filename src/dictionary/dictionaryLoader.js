import { DICTIONAY_TYPE_SYSTEM, DICTIONARY_FORMAT_MDICT, DICTIONARY_FORMAT_TEXT } from './dictConstants.js'
import { TextDictionary } from './text/TextDictionary.js'
import { MdictDictionary } from './mdict/MdictDictionary.js'
import { findMdictProfile } from './mdict/mdictProfileRegister.js'
import { INDEX_VERSION } from './index.js'

export const INDEX_STATUS_NOT_SUPPORT = 'NOT_SUPPORT';
export const INDEX_STATUS_OK = 'OK';
export const INDEX_STATUS_VERSION_MISMATCH = 'VERSION_MISMATCH';
export const INDEX_STATUS_NONE = 'NONE';

function createDictionaryInstance(meta, data, name, checkIndex){
    const { format } = meta;

    if(checkIndex && !isIndexValid(meta, data.index)){
        return null;
    }

    if(format == DICTIONARY_FORMAT_MDICT){        
        return new MdictDictionary(data, name, { rawType: 'extracted'});
    } else if(format == DICTIONARY_FORMAT_TEXT){        
        return new TextDictionary(data, name);
    } 
    throw new Error(`invalid format: ${format}`);
}

function canBeParsed(meta){
    const { format, data } = meta;
    const rawMeta = data.raw;

    if(format == DICTIONARY_FORMAT_MDICT){        
        let profile = findMdictProfile(rawMeta);
        if(profile){
            return true;
        }else{
            return false;
        }
    } else if(format == DICTIONARY_FORMAT_TEXT){        
        return true;
    } 

    return false;
}

function getIndexStatus(meta) {

    let support = meta.data?.index?.support;
    if(support == false){
        return INDEX_STATUS_NOT_SUPPORT;
    }

    if(meta.type == DICTIONAY_TYPE_SYSTEM) {
        return INDEX_STATUS_OK;
    } else {

        let indexVersion = meta.data?.index?.version;

        if (!indexVersion) {
            return INDEX_STATUS_NONE;
        }

        if (indexVersion != INDEX_VERSION) {
            return INDEX_STATUS_VERSION_MISMATCH;            
        }

        return INDEX_STATUS_OK;
    }
}

function isIndexValid(meta, index) {
    let indexStatusOfMeta = getIndexStatus(meta);

    let indexVersionOfMeta = meta.data.index?.version;
    let indexVersionOfIndex = index?.version;

    if (indexStatusOfMeta == INDEX_STATUS_OK && indexVersionOfMeta == indexVersionOfIndex) {
        return true;
    } else {
        return false;
    }
}



export { createDictionaryInstance, canBeParsed, getIndexStatus, isIndexValid }