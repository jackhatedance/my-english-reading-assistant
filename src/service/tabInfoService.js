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

async function setTabInfoArray(tabInfos){
    //console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
    let object = {tabInfos: tabInfos};     
    await  chrome.storage.local.set(object);
}

async function getTabInfoMap(){
    let tabInfoArray = await getTabInfoArray();
    let tabInfoMap = arrayToMap(tabInfoArray);
    return tabInfoMap;
}

async function setTabInfoMap(tabInfoMap){
    let tabInfoArray = mapToArray(tabInfoMap);
    await setTabInfoArray(tabInfoArray);
}

async function getTabInfo(tabId){
    let map  = await getTabInfoMap();
    return map.get(tabId);
}

async function setTabInfo(tabId, tabInfo){
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
    let tabInfoMap  = await getTabInfoMap();
    
    tabInfoMap.set(tabId, tabInfo);
    
    let tabInfoArray = mapToArray(tabInfoMap);
    await setTabInfoArray(tabInfoArray);    
}

async function removeTabInfo(tabId){
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
    let tabInfoMap  = await getTabInfoMap();
    
    tabInfoMap.delete(tabId);
    
    let tabInfoArray = mapToArray(tabInfoMap);
    await setTabInfoArray(tabInfoArray);    
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

export { getTabInfoMap, setTabInfoMap, getTabInfo, setTabInfo, removeTabInfo };