/**
 * refer to https://developer.chrome.com/docs/extensions/how-to/integrate/google-analytics-4
 */
import { getOrCreateClientId, getOrCreateSessionId } from './track-base.js'


const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = `G-RWCD6JHCBD`;
const API_SECRET = `8lmo9OsFQQOSDmcwqr1xag`;

const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

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

    fetch(
    `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
    {
        method: 'POST',
        body: JSON.stringify({
            client_id: clientId,
            events: events,
        }),
    }
    );
}

export { collect }