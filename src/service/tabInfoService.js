'use strict';

function getTabInfoArray(){
    return new Promise(resolve => {
        chrome.storage.local.get(['tabInfos'], (result) => {
            //console.log('load sitesOptions:'+JSON.stringify(result.sitesOptions));
            
            let tabInfos = result.tabInfos;
            if(!tabInfos){
                tabInfos = [];
            }
      
            resolve(tabInfos);
        });
    });
}

async function saveTabInfoArray(tabInfos){
    //console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
    let object = {tabInfos: tabInfos};     
    await  chrome.storage.local.set(object);
}

async function getTabInfoMap(){
    let tabInfoArray = await getTabInfoArray();
    let tabInfoMap = arrayToMap(tabInfoArray);
    return tabInfoMap;
}

async function saveTabInfoMap(tabInfoMap){
    let tabInfoArray = mapToArray(tabInfoMap);
    await saveTabInfoArray(tabInfoArray);
}

async function getTabInfo(tabId){
    let map  = await getTabInfoMap();
    return map.get(tabId);
}

async function saveTabInfo(tabId, tabInfo){
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
    let tabInfoMap  = await getTabInfoMap();
    
    tabInfoMap.set(tabId, tabInfo);
    
    let tabInfoArray = mapToArray(tabInfoMap);
    await saveTabInfoArray(tabInfoArray);    
}

async function removeTabInfo(tabId){
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
    let tabInfoMap  = await getTabInfoMap();
    
    tabInfoMap.delete(tabId);
    
    let tabInfoArray = mapToArray(tabInfoMap);
    await saveTabInfoArray(tabInfoArray);    
}


function arrayToMap(array) {

    const map = new Map();
    array.forEach((obj) => {
        if(!obj){
            return;
        }
        let key = obj.tabId;
        map.set(key, obj);
    });
    return map;
}

function mapToArray(map) {
    let array = [];
    for (let key of map.keys()) {
        let obj = map.get(key);
        array.push(obj);
    }
    return array;
}

export { getTabInfoMap, saveTabInfoMap, getTabInfo, saveTabInfo, removeTabInfo };