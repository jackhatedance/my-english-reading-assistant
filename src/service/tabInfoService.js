'use strict';
import log from 'loglevel'

const gLogger = log.getLogger('user-tabs-service');

async function getUserTabs(){
    let object = await chrome.storage.local.get(['userTabs']);
    let userTabs = object.userTabs;
    if(!userTabs){
        userTabs = {
            userState: null,
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


export { getUserTabs, saveUserTabs, findTab, setTab, removeTab, getTabInfo };