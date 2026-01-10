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
async function collect(events){
    const clientId = await getOrCreateClientId();
    const sessionId = await getOrCreateSessionId();

    for(const event of events){
        event.params.session_id = sessionId;
        event.params.engagement_time_msec = DEFAULT_ENGAGEMENT_TIME_IN_MSEC;
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

function generatePageViewEvent(){
    return {
            name: "page_view",
            params: {
                page_title: document.title,
                page_location: document.location.href
            },
        };
}

export { collect, generatePageViewEvent }