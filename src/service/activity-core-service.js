import { getOptions } from './optionService.js'
import { synchronized } from '../user-activity/lock.js'
import { getUserTabs, saveUserTabs, collectGarbageTabs } from './tab-service.js';
import { addActivityToStorage } from './activityService.js';
import { truncateString } from '../utils/stringUtils.js'
import { process, EVENT_INITIALIZED, EVENT_CLEANED, EVENT_BLUR, EVENT_FOCUS, EVENT_IDLE_STATE_CHANGED, EVENT_TAB_CREATED, EVENT_TAB_UPDATED, EVENT_TAB_REMOVED, EVENT_WORD_MARKED } from '../activity/activity-core.js'
import { formatDuration } from '../activity/activity-utils.js'

import log from 'loglevel'



const gLogger = log.getLogger('activity-service');

async function onTabCreated(tab){
  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tab, saveReadingActivity};
    await process(userTabs, EVENT_TAB_CREATED, args);
  });
}

async function onTabUpdated(tabId, changeInfo, tab){
  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tabId, changeInfo, tab, saveReadingActivity};
    await process(userTabs, EVENT_TAB_UPDATED, args);
  });
}

async function synchonizedUserTabs(asyncCallback){
  await synchronized(async ()=> {
    //console.log('new tab info:'+ JSON.stringify(newTabInfo));
    let userTabs = await getUserTabs();
    
    await asyncCallback(userTabs);
    
    await saveUserTabs(userTabs);
  });
}

async function onAnnotationInitialized(tabId, newTabInfo, tab){
  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tabId, newTabInfo, tab, saveReadingActivity};
    await process(userTabs, EVENT_INITIALIZED, args);
  });
}

async function onAnnotationCleaned(tabId){
  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tabId, saveReadingActivity};
    await process(userTabs, EVENT_CLEANED, args);
  });
}

/**
 * when user switch from current tab
 * @param {*} tabId 
 */
async function onTabBlurred(tabId){

  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tabId, saveReadingActivity};
    await process(userTabs, EVENT_BLUR, args);
  });
}

/**
 * this event followed after the BLUR event
 * @param {*} tabId 
 */
async function onTabFocused(tabId){
  await synchonizedUserTabs(async (userTabs)=> {
    let args = {tabId, saveReadingActivity};
    await process(userTabs, EVENT_FOCUS, args);
  });
}

async function onTabRemoved(tabId){
  await synchonizedUserTabs(async (userTabs)=> {
    
    const args = {tabId, saveReadingActivity, collectGarbageTabs};
    await process(userTabs, EVENT_TAB_REMOVED, args);

  });
}

async function onWordMarked(tabId, wordChanges){
  await synchonizedUserTabs(async (userTabs)=> {
    
    const args = { tabId, wordChanges };
    await process(userTabs, EVENT_WORD_MARKED, args);
  });
  //console.log(`mark word, tabId:${tabId}, changes:${wordChanges}`);
}

async function onIdleStateChanged(newState){
  await synchonizedUserTabs(async (userTabs)=> {
    let idleState = newState;
    let args = { idleState, saveReadingActivity };
    await process(userTabs, EVENT_IDLE_STATE_CHANGED, args);
    
  });
}

async function saveReadingActivity(tabInfo){
  //gLogger.debug('saveReadingActivityAndClearStartTime()');
  
  if(tabInfo.startTime == null){
    gLogger.error(`page [${truncateString(tabInfo.title, 20)}] startTime is null`);
  }

  if(tabInfo.startTime){

    let endTime = new Date().getTime();
    var duration = endTime - tabInfo.startTime;
    
    gLogger.debug(`save reading activity. "${truncateString(tabInfo.title, 20)}", ${formatDuration(duration)}`);
    await addActivityToStorage({
      startTime: tabInfo.startTime,
      endTime: endTime,
      site: tabInfo.site,
      url: tabInfo.url,
      isbn: tabInfo.isbn,
      sessionId: tabInfo.tabId,
      duration: duration,
      title: tabInfo.title,
      totalWordCount: tabInfo.totalWordCount,
      wordChanges: tabInfo.wordChanges, 
    });

    //tabInfo.startTime = null;
  }
}

export { onAnnotationInitialized, onAnnotationCleaned, onTabBlurred, onTabFocused, onTabCreated, onTabUpdated, onTabRemoved, onWordMarked, onIdleStateChanged }