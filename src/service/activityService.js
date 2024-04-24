'use strict';

import {loadKnownWords, calculateKnownWordsCount} from '../vocabularyStore.js';


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
    //console.log('add new activity:'+JSON.stringify(newActivity));

    const MIN_DURATION_IN_MILLISECONDS = 5 * 1000;
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
            && item.title === newActivity.title
            && item.sessionId===newActivity.sessionId 
            && timeDiff < MAX_SESSION_TIME_IN_MILLISECONDS){
            //merge
            item.duration = item.duration + newActivity.duration;
            item.wordChanges = item.wordChanges + newActivity.wordChanges;

            item.endTime = newActivity.endTime;
            item.vocabularySize= vocabularySize;

            merged = true;
        }
    }
    if(!merged){
        newActivity.vocabularySize= vocabularySize;
        activities.push(newActivity);
    }

    const MAX_SIZE = 1000;
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