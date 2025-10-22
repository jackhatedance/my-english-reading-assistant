'use strict';

import {loadKnownWords, calculateKnownWordsCount} from '../vocabularyStore.js';
import { activityToString } from '../activity/activity-utils.js'
import log from 'loglevel'

const gLogger = log.getLogger('activity-service');

function loadActivitiesFromStorage(){
    return new Promise(resolve => {
        chrome.storage.local.get(['activities'], (result) => {
            //console.log('load reading history:'+JSON.stringify(result.readingHistory));
            
            let activities = result.activities;
            if(!activities){
                activities = result.readingHistory;
            }
            if(!activities){
                activities = [];
            }
            
            resolve(activities);
        });
    });
}

async function addActivityToStorage(newActivity){
    gLogger.debug('add new activity:'+ activityToString(newActivity));

    const MIN_DURATION_IN_MILLISECONDS = 1 * 1000;
    const MIN_PAGE_WORD_COUNT = 10;
    const MAX_SESSION_TIME_IN_MILLISECONDS = 4 * 3600 * 1000;

    if(newActivity.duration < MIN_DURATION_IN_MILLISECONDS
        && newActivity.wordChanges == 0){
        return;
    }

    if(newActivity.totalWordCount < MIN_PAGE_WORD_COUNT){
        return;
    }
    
    let result = await chrome.storage.local.get(['activities']);
    
    let activities = result.activities;
    
    if(!activities){
        activities = [];
    }

    let vocabulary = await loadKnownWords();
    let vocabularySize = calculateKnownWordsCount(vocabulary);
    
    
    //merge session data
    let merged = false;
    for(let item of activities){
        let timeDiff = new Date().getTime() - item.endTime;
        if(
            item.site === newActivity.site
            && item.url === newActivity.url
            && item.sessionId===newActivity.sessionId 
            && timeDiff < MAX_SESSION_TIME_IN_MILLISECONDS){
            //merge
            item.duration = item.duration + newActivity.duration;
            item.wordChanges = item.wordChanges + newActivity.wordChanges;

            item.endTime = newActivity.endTime;
            item.vocabularySize= vocabularySize;

            item.isbn = newActivity.isbn;
            item.title = newActivity.title;

            merged = true;

            gLogger.debug('merged activity:'+ activityToString(item));
        }
    }
    if(!merged){
        newActivity.vocabularySize= vocabularySize;
        activities.push(newActivity);
    }

    const MAX_SIZE = 100000;
    if(activities.length>MAX_SIZE){
        activities.shift();
    }
    
    activities.sort(function(a, b){return a.endTime - b.endTime});
    let object = {activities: activities};
    //console.log('save activities:'+JSON.stringify(activities));
    await chrome.storage.local.set(object);
    
       
}
async function deleteAllReadingHistory(){
    await chrome.storage.local.remove("activities");
}

  
export {loadActivitiesFromStorage, addActivityToStorage, deleteAllReadingHistory};