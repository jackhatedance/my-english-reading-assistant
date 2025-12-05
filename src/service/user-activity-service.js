import { getOptions } from './optionService.js'
import { synchronized } from '../user-activity/lock.js'
import { getUserTabs, saveUserTabs, findTab, setTab, removeTab } from './tabInfoService.js';
import { addActivityToStorage } from './activityService.js';

import log from 'loglevel'

const USER_STATE_IDLE = 'idle';
const USER_STATE_ACTIVE = 'active';

const WINDOW_STATE_FOCUSED = 'focused';
const WINDOW_STATE_BLURRED = 'blurred';

const gLogger = log.getLogger('user-activity-service');


async function onTabInitialized(tabId, newTabInfo){

  await synchronized(async ()=> {
    //console.log('new tab info:'+ JSON.stringify(newTabInfo));
    let userTabs = await getUserTabs();
    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    
    if(tabInfo){

        let urlSame = tabInfo.url == newTabInfo.url;
        
        if(!urlSame && tabInfo.startTime){
            await saveReadingActivityAndClearStartTime(tabInfo);
        } else {
            newTabInfo.startTime = tabInfo.startTime;
        }

        if(tabInfo.windowState == WINDOW_STATE_BLURRED){
            newTabInfo.startTime = null;
        }
    }

    tabs = setTab(tabs, newTabInfo);
    userTabs.tabs = tabs;
    await saveUserTabs(userTabs);
  });
}

async function onTabCleaned(tabId){
  await synchronized(async ()=> {
    let userTabs = await getUserTabs();
    let tabs = userTabs.tabs;
    let oldTabInfo = findTab(tabs, tabId);
    
    if(oldTabInfo && oldTabInfo.startTime){
      await saveReadingActivityAndClearStartTime(oldTabInfo);
    }

    tabs = removeTab(tabs, tabId);
    userTabs.tabs = tabs;
    await saveUserTabs(userTabs);
  });
}

/**
 * when user switch from current tab
 * @param {*} tabId 
 */
async function onTabBlur(tabId){
  await synchronized(async ()=> {
    let userTabs = await getUserTabs();
    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
      //console.log('blur');
      await saveReadingActivityAndClearStartTime(tabInfo);
      
      tabInfo.windowState = WINDOW_STATE_BLURRED;

      await saveUserTabs(userTabs);
    }
  });
}

/**
 * this event followed after the BLUR event
 * @param {*} tabId 
 */
async function onTabFocus(tabId){
  await synchronized(async ()=> {
    let userTabs = await getUserTabs();
    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
      //console.log('focus');
      if(tabInfo.startTime !=null){
        //gLogger.warn('start time is not null, something is wrong');
        //start time is not null, because tab is blurred after it is initialized
      }

      //anyway, set start time to now.
      gLogger.debug('set start time');
      tabInfo.startTime = new Date().getTime();
      
      tabInfo.windowState = WINDOW_STATE_FOCUSED;

      await saveUserTabs(userTabs);
    }
  });
}

async function onTabRemoved(tabId){
    await synchronized(async ()=> {
        //console.log('tab removed: '+ 'tabId:' + tabId +','+ JSON.stringify(removeInfo));
        let userTabs = await getUserTabs();
        let tabs = userTabs.tabs;
        let tabInfo = findTab(tabs, tabId);
        if(tabInfo){
            await saveReadingActivityAndClearStartTime(tabInfo);

            tabs = removeTab(tabs, tabId);
            userTabs.tabs = tabs;
            await saveUserTabs(userTabs);
        }
    
    });
}

async function onUrlChanged(tabId, newTabInfo){
  await synchronized(async ()=> {
    let userTabs = await getUserTabs();
    let tabs = userTabs.tabs;
    let oldTabInfo = findTab(tabs, tabId);
    
    if(oldTabInfo){
      await saveReadingActivityAndClearStartTime(oldTabInfo);
    }

    tabs = setTab(tabs, newTabInfo);
    userTabs.tabs = tabs;
    await saveUserTabs(userTabs);
  });
}

async function onMarkWord(tabId, wordChanges){
  await synchronized(async ()=> {
    let userTabs = await getUserTabs();
    let tabInfo = findTab(userTabs.tabs, tabId);
    
    if(tabInfo){
      tabInfo.wordChanges = tabInfo.wordChanges + wordChanges;
      await saveUserTabs(userTabs);
    }else{
      console.error(`tabInfo not found of tab id: ${tabId}`);
    }
  });
  //console.log(`mark word, tabId:${tabId}, changes:${wordChanges}`);
}

async function onUserStateChanged(newState){

  if(newState =='idle'){
    await synchronized(async ()=> {
      
      //check errors
      let userTabs = await getUserTabs();
      let tabInfoArray = userTabs.tabs;
      let activeTabInfos = tabInfoArray.filter(tabInfo => tabInfo.startTime!=null);
      let size = activeTabInfos.length;
      if(size>1){
        let activeTabTitles = activeTabInfos.map(activeTab => activeTab.title);
        let activeTabTitlesStr = activeTabTitles.join(';');
        gLogger.error(`more than one active tab: ${activeTabTitlesStr}`);
      }

      //save time of the (first) active tab
      let activeTabInfo = tabInfoArray.find(tabInfo => tabInfo.startTime!=null);
      if(activeTabInfo){
        await saveReadingActivityAndClearStartTime(activeTabInfo);
      }
      
      //clear startTime for all tabs
      tabInfoArray.forEach(tabInfo => tabInfo.startTime = null);
      await saveUserTabs(userTabs);
    });
  }
}

async function saveReadingActivityAndClearStartTime(tabInfo){
  gLogger.debug('saveReadingActivityAndClearStartTime()');
  let options = await getOptions();
  //console.log('get options from cache:'+JSON.stringify(options));
  if(!options.report.enabled){
    return;
  }

  if(tabInfo.startTime == null){
    gLogger.error(`tab ${tabInfo.title} startTime is null`);
  }

  if(tabInfo.startTime){

    let endTime = new Date().getTime();
    var duration = endTime - tabInfo.startTime;
    
    gLogger.debug(`finish read page <<${tabInfo.url}>> in ${duration/1000} seconds, word changes:${tabInfo.wordChanges}`);
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

    tabInfo.startTime = null;
  }
}

export { onTabInitialized, onTabCleaned, onTabBlur, onTabFocus, onTabRemoved, onUrlChanged, onMarkWord, onUserStateChanged }