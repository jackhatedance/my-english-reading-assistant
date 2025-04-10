import { loadDictionaryRawData, loadAllDictionaryExtractedRawData, loadDictionaryIndexData, saveDictionaryData, saveDictionaryIndexData, saveDictionaryExtractedResourceData, deleteDictionaryData, deleteDictionaryIndexData, loadDictionaryMetas, saveDictionaryMetas } from '../store/dictionaryStore.js'
import { deleteDictionaryAllResourceFiles } from '../store/db.js'
import { TextDictionary } from './text/TextDictionary.js'
import { createDictionaryInstance, getIndexStatus, isIndexValid, canBeParsed } from './dictionaryLoader.js'
import { generateIndex } from './index.js'
import { createSystemDictionaryMeta, loadSystemDictionariesToCache } from './systemDictionary.js'
import { DICTIONARY_INDEX_STATUS_OK } from './dictConstants.js'


//memory copies of dictionary from store
var gCustomDictionaries = {};
var gIndexBuildingJobs = [];
var gAllDictionaryMetas = [];

/**
 * only call this when a page is enabled.
 * it use lot of memory.
 * @param {*} additionalDictionaryNames 
 */
async function initializeCustomDictionaryService(additionalDictionaryNames, dataTypes, options){

    await loadSystemDictionariesToCache();
    
    await loadCustomDictionariesToCache(additionalDictionaryNames, dataTypes, options);
}

async function loadCustomDictionary(dictionaryMeta, dataTypes, options){
    let name = dictionaryMeta.name;
    
    let raw, index;
    if(dataTypes.includes('raw')){
        if(dictionaryMeta.format == 'mdict'){
            if(options?.rawType == 'extracted'){
                raw = await loadAllDictionaryExtractedRawData(name, ['.mdx', '.css']);
            }else{            
                raw = await loadDictionaryRawData(name);
            }
        }else{
            raw = await loadDictionaryRawData(name);
        }    
    }

    if(dataTypes.includes('index')){
        index = await loadDictionaryIndexData(name);          
    }
    
    let data = { raw, index };    
    
    let dictionary;
    if(dictionaryMeta.format == 'text'){
        if(Array.isArray(data)){
            dictionary = new TextDictionary(data, name);
        }else {
            dictionary = new TextDictionary(data, name);
        }
    }else if(dictionaryMeta.format == 'mdict'){
        let checkIndex = dataTypes.includes('index');
        dictionary = createDictionaryInstance(dictionaryMeta, data, name, checkIndex);
    }
    
    return dictionary;
}


function getCleanMeta(meta){
    return {
        name: meta.name,
        alias: meta.alias,
        type: meta.type,
        format: meta.format,
        definitionFormat: meta.definitionFormat,
        package: meta.package,
        size: meta.size,
        fromLanguage: meta.fromLanguage,
        toLanguage: meta.toLanguage,
        enabled: meta.enabled,
        data: {
            raw:{
                headers: meta.data.raw?.headers,
                
            },
            index:{
                version: meta.data.index?.version,
            },

        },
    };
}

async function saveDictionaryMeta(dictionaryMeta){
    let cleanMeta = getCleanMeta(dictionaryMeta);    

    let metas = await getAllDictionaryMetas();
    
    //remove exsiting same name meta
    let index = metas.findIndex(item => item.name == dictionaryMeta.name);
    if(index >=0 ){        
        metas[index] = cleanMeta;        
    }else{
        metas.push(cleanMeta);
    }
    
    await setAllDictionaryMetas(metas);
    //console.log(`saved dictionary meta: ${dictionaryMeta.name}`);
}

async function getAllDictionaryMetas(){
    let metas = await loadDictionaryMetas();
    if(!metas){
        metas = [];
    }

    //add system dictionaries if missing
    const systemDictionaryNames = ['#small', '#large', '#affix'];
    for(let name of systemDictionaryNames.reverse()) {

        let meta = metas.find((item) => item.name == name);        
        if(!meta){
            meta = createSystemDictionaryMeta(name);

            metas.unshift(meta);
        }
    }

    for(let meta of metas){        
        
        meta.displayName = meta.alias? meta.alias : meta.name; 
        
        //computed property
        let bCanBeParsed = canBeParsed(meta);
        meta.data.index.support = bCanBeParsed;

        let indexStatus = getIndexStatus(meta);
        meta.data.index.status = indexStatus;        
    }    

    return metas;    
}

function getEnabledDictionaryNamesFromCache(){
    return gAllDictionaryMetas.filter(item => item.enabled).map(item => item.name);      
}

async function getAdditionalDictionaryMetas(){
    let metas = await getAllDictionaryMetas();
    return metas.filter(meta => meta.data.index.status == DICTIONARY_INDEX_STATUS_OK && meta.enabled != true);      
}

async function changeOrder(names){
    let metas = await getAllDictionaryMetas();

    metas.sort((a,b)=> names.indexOf(a.name) - names.indexOf(b.name));
    await setAllDictionaryMetas(metas);
}

async function getDictionaryMeta(name){
    let metas = await getAllDictionaryMetas();
    let result = null;
    for(let meta of metas){
        if(meta.name == name){
             result = meta;
             break;
        }
    }
    
    return result;
}

async function setAllDictionaryMetas(dictionaryMetas){
    await saveDictionaryMetas(dictionaryMetas);
}

async function deleteDictionaryMeta(name){
    let metas = await getAllDictionaryMetas();
    if(!metas){
        metas = [];
    }

    let newMetas = [];
    //remove exsiting same name meta
    for(let meta of metas){
        if(meta.name !== name){
            newMetas.push(meta);
        }
    }  
    await setAllDictionaryMetas(newMetas);
}

async function loadCustomDictionariesToCache(additionalDictionaryNames, dataTypes, options){
    let metas = await getAllDictionaryMetas();
    gAllDictionaryMetas = metas;

    for(let meta of metas) {
        if(meta.enabled || additionalDictionaryNames.includes(meta.name)){
            await loadCustomDictionaryToCache(meta, dataTypes, options);
        }        
    }    
}

async function updateAdditionalDictionariesInCache(activeAdditionalDictionaryNames, dataTypes, options){
    for(let meta of gAllDictionaryMetas){
        let name = meta.name;
        let isAdditional = meta.enabled != true && meta.data.index.status == DICTIONARY_INDEX_STATUS_OK;
        if(isAdditional){
            if(activeAdditionalDictionaryNames.includes(name)){
                await loadCustomDictionaryToCache(meta, dataTypes, options);
            }else{
                removeCustomDictionaryFromCache(name);
            
            }
        }
    }
}

async function loadCustomDictionaryToCache(meta, dataTypes, options){
    const name = meta.name;
    
    let dict = await loadCustomDictionary(meta, dataTypes, options);
    if(dict){
        gCustomDictionaries[name] = dict;
        //console.log(`load dictionary to cache ${name}`);
    } else{
        removeCustomDictionaryFromCache(name);
        //console.log(`failed to load dictionary to cache: ${name}`);
    }
}

function removeCustomDictionaryFromCache(name) {
    if(gCustomDictionaries.hasOwnProperty(name)){
        delete gCustomDictionaries[name];
        console.log(`remove dictionary from cache: ${name}`);
    }
}

//sync function, get from memory.
function getCustomDictionary(name){
    return gCustomDictionaries[name];
}

async function deleteCustomDictionary(name){
    delete gCustomDictionaries.name;
    await deleteDictionaryData(name);
}

async function deleteDictionary(name){
    delete gCustomDictionaries.name;
    await deleteDictionaryData(name);
    await deleteDictionaryMeta(name);
}

async function addCustomDictionary(name, data){
    gCustomDictionaries[name] = data;
    await saveDictionaryData(name, data);
}

async function saveDictionary(dictionary){
    const { meta, data } = dictionary;
    let name = meta.name;
    
    gCustomDictionaries[name] = data;
    await saveDictionaryMeta(meta);
    await saveDictionaryData(name, data);
}

async function migrateAllDictionaries(updateProgress){
    let metas = await getDictionaryWithInvalidIndexes();
    
    let count = metas.length;
    if(count > 0){
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon_128.png',
            title: chrome.i18n.getMessage('notification_build_index_title_start'),
            message: chrome.i18n.getMessage('notification_build_index_message_start'),
            priority: 0
        });  

        for(let meta of metas){
            await migrateDictionary(meta, (progress) => updateProgress(meta.name, progress));        
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon_128.png',
            title: chrome.i18n.getMessage('notification_build_index_title_end'),
            message: chrome.i18n.getMessage('notification_build_index_message_end'),
            priority: 0
        }); 
    }
    console.log(`${count} dictionary has been upgraded.`);
}

async function getDictionaryWithInvalidIndexes(){
    let dictionaryMetas = await getAllDictionaryMetas();
    let dictionaryMetasOfInvalidIndexes = [];
    for(let meta of dictionaryMetas){
        let name = meta.name;
        if(meta && meta.type != 'system' && meta.data.index.support){
            let index = await loadDictionaryIndexData(name);
            let isValid = isIndexValid(meta, index);
            if(!isValid){
                dictionaryMetasOfInvalidIndexes.push(meta);
            }
        }
    }
    return dictionaryMetasOfInvalidIndexes;
}
//run in background
async function migrateDictionary(dictionary, updateProgress){
    let meta = dictionary;
    if(typeof dictionary === 'string'){
        meta = await getDictionaryMeta(dictionary);
    }
    //console.log('check if index need upgrade: '+ name);

    let name = meta.name;
    if(gIndexBuildingJobs.includes(name)){
        console.log(`an index job is working on ${name}`);
        return;
    }
    gIndexBuildingJobs.push(name)

    console.log('start upgrade: '+ name);
    try {
        let raw = await loadDictionaryRawData(name);            
        let dictionaryInstance = createDictionaryInstance(meta, { raw }, '', false);

        if(meta.format == 'mdict'){
            console.log('extract dictionary resource data: '+ name);

            let rawFileMap = raw;
            
            if(dictionaryInstance.hasMddFile(rawFileMap)){
                await deleteDictionaryAllResourceFiles(name);

                let extractedResourceData = await dictionaryInstance.extractResourceData(updateProgress);
                await saveDictionaryExtractedResourceData(name, extractedResourceData, updateProgress);            
            }
        }        
        
        if(dictionaryInstance.supportOutputFormat('json')){
            let index = await generateIndex(dictionaryInstance, updateProgress);
        
            await saveDictionaryIndexData(name, index);
    
            meta.data.index = {
                version: index.version,
            };
            await saveDictionaryMeta(meta);    
        }
        
        updateProgress({job:'upgrade', rate:1, remain: 0});
        console.log('complete upgrade: '+ name);
    } catch(error) {
        console.log('build index failed', error);
    } finally {
        let index = gIndexBuildingJobs.indexOf(name);
        if (index > -1) {
            gIndexBuildingJobs.splice(index, 1); // Removes 1 element at the index
        }
    }

}

async function deleteDictionaryIndex(name){

    let meta = await getDictionaryMeta(name);
    meta.data.index = {};
    await saveDictionaryMeta(meta);
    
    await deleteDictionaryIndexData(name);
}

export { initializeCustomDictionaryService, getCustomDictionary, addCustomDictionary, saveDictionary, deleteCustomDictionary, deleteDictionary, getAllDictionaryMetas, getDictionaryMeta, getEnabledDictionaryNamesFromCache, getAdditionalDictionaryMetas, updateAdditionalDictionariesInCache, saveDictionaryMeta, deleteDictionaryMeta, deleteDictionaryIndex, migrateDictionary, migrateAllDictionaries, changeOrder, loadCustomDictionary }