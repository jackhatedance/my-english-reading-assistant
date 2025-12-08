'use strict';
import log from 'loglevel'

const gLogger = log.getLogger('tabs-service');

async function getUserTabs(){
    let object = await chrome.storage.local.get(['userTabs']);
    let userTabs = object.userTabs;
    if(!userTabs){
        userTabs = {
            idleState: null,
            tabs: []
        };
    }
    return userTabs;
}

async function saveUserTabs(userTabs){
    //console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
    let object = {userTabs: userTabs};     
    await  chrome.storage.local.set(object);
}

async function collectGarbageTabs(userTabs){
    let chromeTabs = await chrome.tabs.query({ });
    let existingTabIds = chromeTabs.map(tab => tab.id);

    let filteredTabInfos = userTabs.tabs.filter(tabInfo => existingTabIds.includes(tabInfo.tabId));
    /*
    console.log(`userTabs.tabs.length: ${userTabs.tabs.length}`);
    console.log(`existingTabIds.length: ${existingTabIds.length}`);
    console.log(`filteredTabInfos.length: ${filteredTabInfos.length}`);
    */
    userTabs.tabs =  filteredTabInfos;
}

async function getTabInfo(tabId){
    let userTabs = await getUserTabs();
    return findTab(userTabs.tabs, tabId);
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

function findTab(tabs, tabId){
    return tabs.find(tabInfo => tabInfo.tabId == tabId);
}

function setTab(tabs, tabInfo){
    let map = arrayToMap(tabs);
    map.set(tabInfo.tabId, tabInfo);
    return mapToArray(map);
}

function removeTab(tabs, tabId){
    let newTabs = tabs.filter(tab => tab.tabId != tabId);
    return newTabs;
}


export { getUserTabs, saveUserTabs, collectGarbageTabs, findTab, setTab, removeTab, getTabInfo };