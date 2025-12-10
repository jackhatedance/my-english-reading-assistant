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

export const EVENT_TAB_UPDATED = 'tabUpdated';
export const EVENT_TAB_REMOVED = 'tabRemoved';

export const EVENT_MARK_WORD = 'markWord';

async function process(userTabs, event, args){
    if(event == EVENT_INITIALIZED){
        await initialized(userTabs, args);
    } else if(event == EVENT_CLEANED){
        await cleaned(userTabs, args);
    } else if(event == EVENT_BLUR){
        await blur(userTabs, args);
    } else if(event == EVENT_FOCUS){
        await focus(userTabs, args);
    } else if(event == EVENT_IDLE_STATE_CHANGED){
        await idleStateChanged(userTabs, args);
    } else if(event == EVENT_TAB_UPDATED){
        await tabUpdated(userTabs, args);
    } else if(event == EVENT_TAB_REMOVED){
        await tabRemoved(userTabs, args);
    } else if(event == EVENT_MARK_WORD){
        await markWord(userTabs, args);
    }
}

/**
 * could be in any state
 * @param {*} userTabs 
 * @param {*} args 
 */
async function initialized(userTabs, args){
    const { tabId, newTabInfo, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    
    let _isIdle = isIdle(userTabs.idleState);
            
    if(tabInfo){
        let isTabFocused = tabInfo.windowState != WINDOW_STATE_BLURRED; 
        let isActiveReading = !_isIdle && isTabFocused;

        newTabInfo.windowState = tabInfo.windowState;
        
        let sameUrl = tabInfo.url == newTabInfo.url;
        
        if(sameUrl){
            if(tabInfo.startTime){
                let duration = new Date().getTime() - tabInfo.startTime;
                gLogger.debug(`continue reading [${truncateString(newTabInfo.title, 20)}], duration: ${formatDuration(duration)}`);
                newTabInfo.startTime = tabInfo.startTime;
            }else{
                if(isActiveReading){
                    startReading(newTabInfo);
                }else{
                    gLogger.debug(`inactive reading [${truncateString(newTabInfo.title, 20)}]`);
                    newTabInfo.startTime = null;
                }
            }
        }else{
            //URL changed
            //gLogger.debug(`stop reading [${truncateString(tabInfo.title, 20)}]`);
            
            if(isActiveReading){
                await saveReadingActivity(tabInfo);
                startReading(newTabInfo);
            }else{
                gLogger.debug(`inactive reading [${truncateString(tabInfo.title, 20)}]`);
                newTabInfo.startTime = null;
            }
        
            
            tabInfo.startTime = null;
        }
    }else{
        if(!_isIdle){
            startReading(newTabInfo);
        }else{
            newTabInfo.startTime = null;
        }
        
    }
    
    tabs = setTab(tabs, newTabInfo);
    userTabs.tabs = tabs;

}

function startReading(tabInfo){
    gLogger.debug(`Start reading [${truncateString(tabInfo.title, 20)}]`);
}

async function cleaned(userTabs, args){
    const { tabId, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    
    if(tabInfo && tabInfo.startTime){
      await saveReadingActivity(tabInfo);
      tabInfo.startTime = null;
    }

    tabs = removeTab(tabs, tabId);
    userTabs.tabs = tabs;
}

async function blur(userTabs, args){
    const { tabId, saveReadingActivity } = args;

    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
        //console.log('blur');

        if(userTabs.idleState == null || userTabs.idleState == IDLE_STATE_ACTIVE){
            await saveReadingActivity(tabInfo);
            tabInfo.startTime = null;
        }
        
        tabInfo.windowState = WINDOW_STATE_BLURRED;

    }

    setIdleState(userTabs, null);
}

async function focus(userTabs, args){
    const { tabId, saveReadingActivity } = args;
    
    let tabInfo = findTab(userTabs.tabs, tabId);
    if(tabInfo){
      //console.log('focus');
      if(tabInfo.startTime !=null){
        //gLogger.warn('start time is not null, something is wrong');
        //start time is not null, because tab is blurred after it is initialized
      }

      //anyway, set start time to now.
      gLogger.debug(`Start reading [${truncateString(tabInfo.title, 20)}]`);
      tabInfo.startTime = new Date().getTime();
      
      tabInfo.windowState = WINDOW_STATE_FOCUSED;

      
    }

    setIdleState(userTabs, null);
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
            gLogger.debug(`Start reading [${truncateString(activeTabInfo.title, 20)}]`);
            activeTabInfo.startTime = new Date().getTime();
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
        await saveReadingActivity(activeTabInfo);
        activeTabInfo.startTime = null;
        userTabs.inactiveTabId = activeTabInfo.tabId;
    }
    
    //clear startTime for all tabs
    tabInfoArray.forEach(tabInfo => tabInfo.startTime = null);
    
}

async function tabUpdated(userTabs, args){
    const { tabId, changeInfo, tab, saveReadingActivity } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    if(tabInfo){

        userTabs.idleState=null;
        if(tab.active==true){
            tabInfo.windowState = WINDOW_STATE_FOCUSED;
        }else{
            tabInfo.windowState = WINDOW_STATE_BLURRED;
        }

        userTabs.tabs = tabs;
    }
}

async function tabRemoved(userTabs, args){
    const { tabId, saveReadingActivity, collectGarbageTabs } = args;

    let tabs = userTabs.tabs;
    let tabInfo = findTab(tabs, tabId);
    if(tabInfo){
        await saveReadingActivity(tabInfo);
        tabInfo.startTime = null;

        tabs = removeTab(tabs, tabId);
        userTabs.tabs = tabs;
    }

    await collectGarbageTabs(userTabs);
    
}


async function markWord(userTabs, args){
    const { tabId, wordChanges } = args;

    let tabInfo = findTab(userTabs.tabs, tabId);
        
    if(tabInfo){
        tabInfo.wordChanges = tabInfo.wordChanges + wordChanges;
        
    }else{
        console.error(`tabInfo not found of tab id: ${tabId}`);
    }
}

export { process }