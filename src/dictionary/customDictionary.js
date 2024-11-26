import { loadDictionary, saveDictionary, deleteDictionary } from '../store/dictionaryStore.js'

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

async function loadCustomDictionariesToCache(names){
    for(let name of names) {
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

export { loadCustomDictionariesToCache, getCustomDictionary, addCustomDictionary, deleteCustomDictionary };