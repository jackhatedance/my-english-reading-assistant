import { loadDictionary, saveDictionary, deleteDictionary, loadDictionaryInfos, saveDictionaryInfos } from '../store/dictionaryStore.js'

//memory copies of dictionary from store
var gCustomDictionaries = {};

async function loadCustomDictionary(name){
    let lines = await loadDictionary(name);
    let dict = {};
    for(let line of lines){
        try{
            const firstSpaceIndex = line.indexOf(" ");
            let word = line.substring(0, firstSpaceIndex);
            let definition = line.substring(firstSpaceIndex+1);
            dict[word] = definition;
        } catch(e){
            console.warn('failed to parse dictionary line:'+line);
        }
        
    }
    //console.log(dict);
    return dict;
}


function getCleanMeta(meta){
    return {
        name: meta.name,
        type: meta.type,
        format: meta.format,
        size: meta.size,
        fromLanguage: meta.fromLanguage,
        toLanguage: meta.toLanguage,
        enabled: meta.enabled,
    };
}

async function saveDictionaryMeta(dictionaryMeta){
    
    let metas = await getAllDictionaryMetas();
    if(!metas){
        metas = [];
    }

    let newMetas = [];

    //remove exsiting same name meta
    for(let meta of metas){
        if(meta.name !== dictionaryMeta.name){
            newMetas.push(meta);
        }
    }    
    
    let cleanMeta = getCleanMeta(dictionaryMeta);    
    newMetas.push(cleanMeta);
    await setAllDictionaryMetas(newMetas);
}


async function getAllDictionaryMetas(){
    return await loadDictionaryInfos();
}

async function getDictionaryMeta(name){
    let metas = await loadDictionaryInfos();
    for(let meta of metas){
        if(meta.name == name){
            return meta;
        }
    } 
    return null;
}

async function setAllDictionaryMetas(dictionaryMetas){
    await saveDictionaryInfos(dictionaryMetas);
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

async function loadCustomDictionariesToCache(){
    let metas = await getAllDictionaryMetas();
    for(let meta of metas) {
        let name = meta.name;
        await loadCustomDictionaryToCache(name);
    }    
}

async function loadCustomDictionaryToCache(name){
    gCustomDictionaries[name] = await loadCustomDictionary(name);
}

//sync function, get from memory.
function getCustomDictionary(name){
    return gCustomDictionaries[name];
}

async function deleteCustomDictionary(name){
    delete gCustomDictionaries.name;
    deleteDictionary(name);
}

async function addCustomDictionary(name, data){
    gCustomDictionaries[name] = data;
    saveDictionary(name, data);
}

export { loadCustomDictionariesToCache, getCustomDictionary, addCustomDictionary, deleteCustomDictionary, getAllDictionaryMetas, getDictionaryMeta, saveDictionaryMeta, deleteDictionaryMeta };