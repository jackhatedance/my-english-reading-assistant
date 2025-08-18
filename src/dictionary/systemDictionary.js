
import {dict as dictAffix} from '../dicts/dict-affix.js'
import { MapDictionary } from './MapDictionary.js'


const gSystemDictionaryMap = {};


async function getDictJson(name){
    let url = chrome.runtime.getURL(`dictionaries/dict-${name}.json`);
    const response = await fetch(url);
    return await response.json();    
}

async function loadSmallDictionary(){
    let dictSmall = await getDictJson('small');
    return new MapDictionary({ raw: dictSmall }, '#small');
}

async function loadLargeDictionary(){
    let dictLarge = await getDictJson('large');
    return new MapDictionary({ raw: dictLarge }, '#large', { });
}

async function loadAffixDictionary(){
    return new MapDictionary({ raw: dictAffix }, '#affix');
}

async function loadSystemDictionary(name){
    if(name==='#small'){
        return await loadSmallDictionary();
    }else if(name==='#large'){
        return await loadLargeDictionary();
    }else if(name==='#affix'){
        return await loadAffixDictionary();
    }else {
        return null;
    }
}

async function loadSystemDictionariesToCache(){

    gSystemDictionaryMap['#small'] = await loadSmallDictionary();
    gSystemDictionaryMap['#large'] = await loadLargeDictionary();
    gSystemDictionaryMap['#affix'] = await loadAffixDictionary();
}

function isSystemDictionary(name){
    return name.startsWith('#');
}
function getSystemDictionaryAlias(name){
    if(name==='#small'){
        return chrome.i18n.getMessage('dictionary_system_small_alias');
    }else if(name==='#large'){
        return chrome.i18n.getMessage('dictionary_system_large_alias');
    }else if(name==='#affix'){
        return chrome.i18n.getMessage('dictionary_system_affix_alias');
    }
    throw new Error(`invliad system dictionary name ${name}`);
}

function getSystemDictionaryFromCache(name){
    return gSystemDictionaryMap[name];
}

function createSystemDictionaryMeta(name){
    if(name == '#small'){
        return createDictionaryMetaSmall();
    } else if(name == '#large'){
        return createDictionaryMetaLarge();
    } else if(name == '#affix'){
        return createDictionaryMetaAffix();
    }
    throw new Error(`invalid system dictionary name: ${name}`);
}

function createDictionaryMetaSmall(){
    return {
        name: '#small',
        alias: getSystemDictionaryAlias('#small'),
        type: 'system',
        format: 'text',
        definitionFormat: 'text',
        package: false,
        size: 281941,
        fromLanguage: 'en',
        toLanguage: 'cn',      
        enabled: true,  
        data: {
            index:{}
        },
    };
}

function createDictionaryMetaLarge(){
    return {
        name: '#large',
        alias: getSystemDictionaryAlias('#large'),
        type: 'system',
        format: 'text',
        definitionFormat: 'text',
        package: false,
        size: 402426,
        fromLanguage: 'en',
        toLanguage: 'cn',  
        enabled: true,      
        data: {
            index:{}
        },
    };
}

function createDictionaryMetaAffix(){
    return {
        name: '#affix',
        alias: getSystemDictionaryAlias('#affix'),
        type: 'system',
        format: 'text',
        definitionFormat: 'text',
        package: false,
        size: 272,
        fromLanguage: 'en',
        toLanguage: 'cn',  
        enabled: true,      
        data: {
            index:{}
        },
    };
}

export { loadSystemDictionary, loadSystemDictionariesToCache, getSystemDictionaryFromCache, createSystemDictionaryMeta, getSystemDictionaryAlias, isSystemDictionary }