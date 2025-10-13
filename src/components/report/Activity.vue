<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import {initializeOptionService} from '../../service/optionService.js';
import {loadActivitiesFromStorage} from '../../service/activityService.js';
import { formatDuration, filterActivityByTimeRange } from '../../report/report-utils.js'

const props = defineProps({
    
    
});
const timeRange = inject('timeRange');
const route = useRoute();
const t = chrome.i18n.getMessage;


watch(() => timeRange.value, async (newValue) => {
    await refresh();
});


function renderReadingActivities(activities){
    let history = activities;

    history.sort(function(a, b){return a.endTime - b.endTime});

    let tableBody = document.getElementById('historyBody');
    tableBody.innerHTML = '';
    
    for(let item of history.reverse()){
        let {startTime, title, url, isbn, totalWordCount, site, wordChanges, duration, endTime, vocabularySize} = item;

        if(!site){
            site='';
        }
        
        if(!isbn){
            isbn='';
        }

        if(!totalWordCount){
            totalWordCount = '';
        }

        if(!duration){
            duration = item.timeSpan;
        }
        if(!vocabularySize){
            vocabularySize='';
        }
        let startTimeFormatted = new Date(startTime).toLocaleString( );
        let endTimeFormatted = new Date(endTime).toLocaleString( );

        let durationFormatted = formatDuration(duration);
        const liInnerHTML = `<td>${startTimeFormatted}</td>
            <td>${endTimeFormatted}</td>
            <td>${site}</td>
            <td><a target="_blank" href='${url}'>${title}</a></td>
            <td>${isbn}</td>
            <td>${totalWordCount}</td>
            <td>${durationFormatted}</td>
            <td>${vocabularySize}(${wordChanges})</td>
        `;

        let tr = document.createElement("tr");
        tr.innerHTML = liInnerHTML;

        tableBody.appendChild(tr);
    }
}

async function refresh(){
    let activities = await loadActivitiesFromStorage();
    activities = filterActivityByTimeRange(activities, timeRange.value);
    renderReadingActivities(activities);
}

const init = async () => {
    await initializeOptionService();
    await refresh();
};


init();
</script>

<template>
    <div class="sites">     
        <h1>{{ t('reportReadingActivitiesTitle') }}</h1>
        <table id="history">
            <thead>
                <tr>
                    <th>{{ t('reportReadingActivitiesHeaderStartTime') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderEndTime') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderSite') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderTitle') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderIsbn') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderWordCount') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderDuration') }}</th>
                    <th>{{ t('reportReadingActivitiesHeaderVocabulary') }}</th>
                </tr>    
            </thead>   
            <tbody id="historyBody">

            </tbody> 
        </table>
    </div>
</template>

<style>



</style>
