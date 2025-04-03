
import {dict as dictLarge} from '../dicts/dict-large.js'
import {dict as dictSmall} from '../dicts/dict-small.js'
import {dict as dictAffix} from '../dicts/dict-affix.js'
import { MapDictionary } from './MapDictionary.js'


const gSystemDictionaryMap = {};

var smallDictionary, largeDictionary, affixDictionary;

async function loadSystemDictionariesToCache(){
    
    smallDictionary = new MapDictionary({ raw: dictSmall }, '#small');
    largeDictionary = new MapDictionary({ raw: dictLarge }, '#large');
    affixDictionary = new MapDictionary({ raw: dictAffix }, '#affix');
        
    gSystemDictionaryMap['#small'] = smallDictionary;
    gSystemDictionaryMap['#large'] = largeDictionary;
    gSystemDictionaryMap['#affix'] = affixDictionary;
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

function getSystemDictionary(name){
    if(name==='#small'){
        return smallDictionary;
    }else if(name==='#large'){
        return largeDictionary;
    }else if(name==='#affix'){
        return affixDictionary;
    }else {
        return null;
    }
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
        size: 60780,
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

export { loadSystemDictionariesToCache, getSystemDictionary, createSystemDictionaryMeta, getSystemDictionaryAlias, isSystemDictionary }