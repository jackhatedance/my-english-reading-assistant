/**
 * refer to https://developer.chrome.com/docs/extensions/how-to/integrate/google-analytics-4
 */
import { getOrCreateClientId, getOrCreateSessionId } from './track-base.js'
import log from 'loglevel'

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = `G-RWCD6JHCBD`;
const API_SECRET = `8lmo9OsFQQOSDmcwqr1xag`;

const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

const gLogger = log.getLogger("google-analytics");

/**
 * 
 * @param {*} events 
 */
async function collect(userProperties, events){
    const clientId = await getOrCreateClientId();
    const sessionId = await getOrCreateSessionId();

    for(const event of events){
        event.params.session_id = sessionId;
        event.params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_IN_MSEC;

        //event.params.debug_mode = true;
    }

    let lastErrorTime = await getLastErrorTimeOfGoogleAnalytics();
    if(lastErrorTime==null){
        lastErrorTime=0;
    }
    let now = Date.now();
    let elapseInMinute = (now - lastErrorTime)/(1000 * 60);
    const PAUSE_TIME_IN_MINUTE = 60 * 1;

    if(elapseInMinute > PAUSE_TIME_IN_MINUTE){

        try {
            await fetch(
                `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        client_id: clientId,
                        user_properties: userProperties,
                        events: events,
                    }),
                }
            );

        } catch (error) {
            gLogger.error("An GA error occurred during fetch:", error.message);
            await updateLastErrorTimeOfGoogleAnalytics();
        }
        
    } else{
        gLogger.debug('GA is muted due to recent error');
    }
}


async function getLastErrorTimeOfGoogleAnalytics() {
  const result = await chrome.storage.local.get('googleAnalytics');
  return result.googleAnalytics?.lastErrorTime;
  
}

async function updateLastErrorTimeOfGoogleAnalytics() {
  let lastErrorTime = Date.now();
  let googleAnalytics = {
    lastErrorTime
  };

  await chrome.storage.local.set({ googleAnalytics });
  
}

const pathTitleMap = {
    "popup.html": "Popup",

    "options.html#/general": "Options - General",
    "options.html#/vocabulary": "Options - Vocabulary",
    "options.html#/annotation": "Options - Annotation",
    "options.html#/notes": "Options - Notes",
    "options.html#/site": "Options - Site",
    "options.html#/book": "Options - Book",
    "options.html#/report": "Options - Report",
    "options.html#/dictionary": "Options - Dictionary",
    "options.html#/interaction": "Options - Interaction",
    "options.html#/advanced": "Options - Advanced",
    "options.html#/unrecognized-words": "Options - Unrecognized-words",

}

function parseUrl(url){
    let pattern = /(?<protocol>[^:]+):\/\/(?<id>[^/]+)\/(?<path>.+)/;
    
    let matchResult = url.match(pattern);
    if(matchResult){
        let id = matchResult.groups.id;
        let path = matchResult.groups.path;
        
        return { id, path };            

    }
}

function getTitleByUrl(url){
    let urlObject = parseUrl(url);
    let path = urlObject?.path;
    if(path && pathTitleMap.hasOwnProperty(path)){
        return pathTitleMap[path];
    }
}

function generatePageViewEvent(){

    let title = getTitleByUrl(document.location.href);
    if(!title){
        title = document.title;
    }
    return {
            name: "page_view",
            params: {
                page_title: title,
                page_location: document.location.href,
                page_path: document.location.pathname
            },
        };
}

export { collect, generatePageViewEvent }