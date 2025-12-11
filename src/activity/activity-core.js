import log from 'loglevel'
import { findTab, setTab, removeTab } from '../service/tab-service.js';
import { truncateString } from '../utils/stringUtils.js'
import { formatDuration } from './activity-utils.js'

const gLogger = log.getLogger('activity-core');

const IDLE_STATE_IDLE = 'idle';
const IDLE_STATE_LOCKED = 'lock';
const IDLE_STATE_ACTIVE = 'active';

const WINDOW_STATE_FOCUSED = 'focused';
const WINDOW_STATE_BLURRED = 'blurred';

export const EVENT_INITIALIZED = 'initialized';
export const EVENT_CLEANED = 'cleaned';

export const EVENT_BLUR = 'blur';
export const EVENT_FOCUS = 'focus';

export const EVENT_IDLE_STATE_CHANGED = 'idleStateChanged';

export const EVENT_TAB_CREATED = 'tabCreated';
export const EVENT_TAB_UPDATED = 'tabUpdated';
export const EVENT_TAB_REMOVED = 'tabRemoved';

export const EVENT_WORD_MARKED = 'wordMarked';

async function process(userTabs, event, args){
    if(event == EVENT_INITIALIZED){
        await annotationInitialized(userTabs, args);
    } else if(event == EVENT_CLEANED){
        await annotationCleaned(userTabs, args);
    } else if(event == EVENT_BLUR){
        await windowBlurred(userTabs, args);
    } else if(event == EVENT_FOCUS){
        await windowFocused(userTabs, args);
    } else if(event == EVENT_IDLE_STATE_CHANGED){
        await idleStateChanged(userTabs, args);
    } else if(event == EVENT_TAB_CREATED){
        await tabCreated(userTabs, args);
    } else if(event == EVENT_TAB_UPDATED){
        await tabUpdated(userTabs, args);
    } else if(event == EVENT_TAB_REMOVED){
        await tabRemoved(userTabs, args);
    } else if(event == EVENT_WORD_MARKED){
        await wordMarked(userTabs, args);
    }
}

/**
 * could be in any state
 * @param {*} userTabs 
 * @param {*} args 
 */
async function annotationInitialized(userTabs, args){
    const { tabId, newTabInfo, tab, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    
    let bIdle = isIdle(userTabs.idleState);

    let bTabActive = tab.active; 
    let bActiveReadingTab = !bIdle && bTabActive;
            
    if(tabInfo){
        newTabInfo.windowState = tabInfo.windowState;
        
        let sameUrl = tabInfo.url == newTabInfo.url;
        
        if(bActiveReadingTab){
            if(tabInfo.startTime){
                if(sameUrl){
                    newTabInfo.startTime = tabInfo.startTime;
                    logReading(newTabInfo, 'continue')
                }else{
                    gLogger.debug(`URL changed from ${tabInfo.url} to ${newTabInfo.url}`);
                    await saveAndStopReading(saveReadingActivity, tabInfo);

                    logReading(newTabInfo, 'start');
                }
            }else{
                logReading(newTabInfo, 'start');
            }
        }else{
            if(tabInfo.startTime){
                await saveAndStopReading(saveReadingActivity, tabInfo);
            }

            logReading(newTabInfo, 'inactive');
            newTabInfo.startTime = null;
        }
    
    }else{
        if(bActiveReadingTab){
            logReading(newTabInfo, 'start');
        }else{
            logReading(newTabInfo, 'inactive');
            newTabInfo.startTime = null;
        }
        
    }
    
    tabs = setTab(tabs, newTabInfo);
    userTabs.tabs = tabs;

}

async function annotationCleaned(userTabs, args){
    const { tabId, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    
    if(tabInfo && tabInfo.startTime){
        await saveAndStopReading(saveReadingActivity, tabInfo);
    }

    tabs = removeTab(tabs, tabId);
    userTabs.tabs = tabs;
}

async function windowBlurred(userTabs, args){
    const { tabId, saveReadingActivity } = args;

    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
        //console.log('blur');

        if(userTabs.idleState == null || userTabs.idleState == IDLE_STATE_ACTIVE){
            await saveAndStopReading(saveReadingActivity, tabInfo);
        }
        
        tabInfo.windowState = WINDOW_STATE_BLURRED;

    }

    setIdleState(userTabs, null);
}

async function windowFocused(userTabs, args){
    const { tabId, saveReadingActivity } = args;
    
    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
      //console.log('focus');
      if(tabInfo.startTime !=null){
        //gLogger.warn('start time is not null, something is wrong');
        //start time is not null, because tab is blurred after it is initialized
      }

      //anyway, set start time to now.
      let now = new Date();
      tabInfo.startTime = now.getTime();
      gLogger.debug(`Start reading [${truncateString(tabInfo.title, 20)}]`);

      tabInfo.windowState = WINDOW_STATE_FOCUSED;

      
    }

    setIdleState(userTabs, null);
}

function isActiveReadingTab(userTabs, tabInfo){
    let bIdle = isIdle(userTabs.idleState);
    let bTabFocused = tabInfo.windowState != WINDOW_STATE_BLURRED; 
    let bActiveReading = !bIdle && bTabFocused;
    return bActiveReading;
}

function isIdle(idleState){
    let _isActive = idleState == null || idleState == 'active';
    return !_isActive;
}

async function idleStateChanged(userTabs, args){
    const {idleState} = args;
    let isIdleResult = isIdle(idleState);
    if(!isIdleResult){
        await active(userTabs, args);
    }else{
        await inactive(userTabs, args);
    }

    setIdleState(userTabs, idleState);
}

function setIdleState(userTabs, idleState){
    userTabs.idleState = idleState;
}

async function active(userTabs, args){
    const { saveReadingActivity } = args;
    const tabs = userTabs.tabs;

    
    //case 1: from idle to active (without locked)
    if(userTabs.idleState==IDLE_STATE_IDLE){
        //check errors
        let activeTabInfos = tabs.filter(tabInfo => tabInfo.startTime!=null);
        let size = activeTabInfos.length;
        if(size>0){
            let activeTabTitles = activeTabInfos.map(activeTab => activeTab.title);
            let activeTabTitlesStr = activeTabTitles.join(';');
            gLogger.error(`more than zero active tab: ${activeTabTitlesStr}`);
        }

        //set start time of the (only) active tab
        let activeTabInfo = tabs.find(tabInfo => tabInfo.tabId == userTabs.inactiveTabId);
        if(activeTabInfo){
            let now = new Date();
            activeTabInfo.startTime = now.getTime();
            gLogger.debug(`Start reading [${truncateString(activeTabInfo.title, 20)}]`);

            userTabs.inactiveTabId = null;
        }
    } else if(userTabs.idleState==IDLE_STATE_LOCKED){
        // case 2: idle -> (blur)locked ->(focus) active
        //do nothing, do in window blur/focus event
    }
}

async function inactive(userTabs, args){
    const { saveReadingActivity } = args;

    //check errors
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
        await saveAndStopReading(saveReadingActivity, activeTabInfo);

        userTabs.inactiveTabId = activeTabInfo.tabId;
    }
    
    //clear startTime for all tabs
    tabInfoArray.forEach(tabInfo => tabInfo.startTime = null);
    
}

async function tabCreated(userTabs, args){
    const { tab, saveReadingActivity } = args;

    setIdleState(userTabs, null);
}

async function tabUpdated(userTabs, args){
    const { tabId, changeInfo, tab, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    if(tabInfo){

        //shot not change idleState here.
        //userTabs.idleState=null;

        /* tab.active will also be passed into the initialize event
        if(tab.active==true){
            gLogger.debug(`window state is active`);
            tabInfo.windowState = WINDOW_STATE_FOCUSED;
        }else{
            gLogger.debug(`window state is inactive`);
            tabInfo.windowState = WINDOW_STATE_BLURRED;
            tabInfo.startTime = null;
        }
        */

        userTabs.tabs = tabs;
    }
}

async function tabRemoved(userTabs, args){
    const { tabId, saveReadingActivity, collectGarbageTabs } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    if(tabInfo){
        let bActiveReadingTab = isActiveReadingTab(userTabs, tabInfo);
        if(bActiveReadingTab){
            if(tabInfo.startTime){
                await saveAndStopReading(saveReadingActivity, tabInfo);
            }else{
                gLogger.debug(`tab ${tabId} has not been read at all`);
            }

            tabs = removeTab(tabs, tabId);
            userTabs.tabs = tabs;
        }
    }
    await collectGarbageTabs(userTabs);

    setIdleState(userTabs, null);
}


async function wordMarked(userTabs, args){
    const { tabId, wordChanges } = args;

    let tabInfo = findTab(userTabs.tabs, tabId);
        
    if(tabInfo){
        tabInfo.wordChanges = tabInfo.wordChanges + wordChanges;
        
    }else{
        console.error(`tabInfo not found of tab id: ${tabId}`);
    }
}

function logReading(tabInfo, action){
    let durationStr = '';
    if(tabInfo.startTime != null){
        let now = new Date();
        let duration = now.getTime() - tabInfo.startTime;
        durationStr = `, for ${formatDuration(duration)}`;
    }

    gLogger.debug(`${action} reading "${truncateString(tabInfo.title, 20)}"${durationStr}`);
}

async function saveAndStopReading(saveReadingActivity, tabInfo){
    logReading(tabInfo, 'stop');
    await saveReadingActivity(tabInfo);
    tabInfo.startTime = null;
}

export { process }