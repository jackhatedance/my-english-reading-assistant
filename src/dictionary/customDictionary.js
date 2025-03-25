import { loadDictionaryData, loadDictionaryRawData, loadDictionaryIndexData, saveDictionaryData, saveDictionaryIndexData, deleteDictionaryData, deleteDictionaryIndexData, loadDictionaryMetas, saveDictionaryMetas } from '../store/dictionaryStore.js'
import { MapDictionary } from './MapDictionary.js'
import { TextDictionary } from './text/TextDictionary.js'
import { createDictionaryInstance, getIndexStatus, isIndexValid, canBeParsed } from './dictionaryLoader.js'
import { generateIndex } from './index.js'
import { createSystemDictionaryMeta, loadSystemDictionariesToCache } from './systemDictionary.js'

//memory copies of dictionary from store
var gCustomDictionaries = {};
var gIndexBuildingJobs = [];
var gAllDictionaryMetas = [];


async function initializeCustomDictionaryService(additionalDictionaryNames){
    await loadSystemDictionariesToCache();
    
    await loadCustomDictionariesToCache(additionalDictionaryNames);
}

async function loadCustomDictionary(dictionaryMeta, indexDataOnly){
    let name = dictionaryMeta.name;
    
    let data;
    if(indexDataOnly){
        let indexData = await loadDictionaryIndexData(name);  
        data = { index: indexData};    
    } else {
        data = await loadDictionaryData(name);
    }
    
    let dictionary;
    if(dictionaryMeta.format == 'text'){
        if(Array.isArray(data)){
            dictionary = new TextDictionary(data, name);
        }else {
            dictionary = new TextDictionary(data, name);
        }
    }else if(dictionaryMeta.format == 'mdict'){
        dictionary = createDictionaryInstance(dictionaryMeta, data, name, true);
    }
    
    return dictionary;
}


function getCleanMeta(meta){
    return {
        name: meta.name,
        alias: meta.alias,
        type: meta.type,
        format: meta.format,
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
    return metas.filter(meta => meta.data.index.status == 'OK' && meta.enabled != true);      
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

async function loadCustomDictionariesToCache(additionalDictionaryNames){
    let metas = await getAllDictionaryMetas();
    gAllDictionaryMetas = metas;

    for(let meta of metas) {
        if(meta.enabled || additionalDictionaryNames.includes(meta.name)){
            await loadCustomDictionaryToCache(meta);
        }        
    }    
}

async function updateAdditionalDictionariesInCache(activeAdditionalDictionaryNames){
    for(let meta of gAllDictionaryMetas){
        let name = meta.name;
        let isAdditional = meta.enabled != true && meta.data.index.status == 'OK';
        if(isAdditional){
            if(activeAdditionalDictionaryNames.includes(name)){
                await loadCustomDictionaryToCache(meta);
            }else{
                removeCustomDictionaryFromCache(name);
            
            }
        }
    }
}

async function loadCustomDictionaryToCache(meta){
    const name = meta.name;
    
    let dict = await loadCustomDictionary(meta, true);
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
    deleteDictionaryData(name);
}

async function deleteDictionary(name){
    delete gCustomDictionaries.name;
    deleteDictionaryData(name);
    deleteDictionaryMeta(name);
}

async function addCustomDictionary(name, data){
    gCustomDictionaries[name] = data;
    saveDictionaryData(name, data);
}

async function saveDictionary(dictionary){
    const { meta, data } = dictionary;
    let name = meta.name;
    
    gCustomDictionaries[name] = data;
    saveDictionaryMeta(meta);
    saveDictionaryData(name, data);
}

async function migrateAllDictionaries(updateProgress){
    let metas = await getDictionaryWithInvalidIndexes();
    
    let count = metas.length;
    if(count > 0){
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon_128.png',
            title: chrome.i18n.getMessage('notification_build_index_title'),
            message: chrome.i18n.getMessage('notification_build_index_message'),
            priority: 0
        });  

        for(let meta of metas){
            await migrateDictionary(meta, (progress) => updateProgress(meta.name, progress));        
        }
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
async function migrateDictionary(meta, updateProgress){
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

        let index = await generateIndex(dictionaryInstance, updateProgress);
        
        await saveDictionaryIndexData(name, index);

        meta.data.index = {
            version: index.version,
        };
        await saveDictionaryMeta(meta);

        updateProgress({rate:1, remain: 0});
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

export { initializeCustomDictionaryService, getCustomDictionary, addCustomDictionary, saveDictionary, deleteCustomDictionary, deleteDictionary, getAllDictionaryMetas, getDictionaryMeta, getEnabledDictionaryNamesFromCache, getAdditionalDictionaryMetas, updateAdditionalDictionariesInCache, saveDictionaryMeta, deleteDictionaryMeta, deleteDictionaryIndex, migrateDictionary, migrateAllDictionaries, changeOrder }