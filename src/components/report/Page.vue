<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import { formatDuration, filterActivityByTimeRange } from '../../report/report-utils.js'
import {initializeOptionService} from '../../service/optionService.js';
import {loadActivitiesFromStorage} from '../../service/activityService.js';


const props = defineProps({
    
    
});

const timeRange = inject('timeRange');

const route = useRoute();
const t = chrome.i18n.getMessage;


watch(() => timeRange.value, async (newValue) => {
    await refresh();
});

function getPageSummaries(activities){
    let pageSummaryMap = new Map();
    for(let activity of activities){
        let site = activity.site;
        let url = activity.url;
        let title = activity.title;
        let isbn = activity.isbn;
        
        let key = url;
        let summary = pageSummaryMap.get(key);
                
        if(!summary){
            summary={
                site: site,
                url: url,
                title: title,
                isbn: isbn,
                startTime: activity.startTime,
                endTime: 0,
                duration: 0,
                wordChanges: 0
            };

            pageSummaryMap.set(key, summary);
        }

        summary.startTime = Math.min(activity.startTime, summary.startTime);
        summary.endTime = Math.max(activity.endTime, summary.endTime);
        summary.duration = summary.duration + activity.duration;      
        summary.wordChanges = summary.wordChanges + activity.wordChanges;
    }

    let array = Array.from(pageSummaryMap, ([name, value]) => ({ ... value}));



    array.sort(function(a, b){return b.endTime - a.endTime;});
    //console.log('page summaries:' + JSON.stringify(array));
    return array;
}


function renderPageSummaries(pageSummaries){
    let table = document.getElementById('pageSummariesBody');
    table.innerHTML = '';

    for(let item of pageSummaries){
        let {site, url, title, isbn, wordChanges, duration, startTime, endTime} = item;

        if(!isbn){
        isbn = '';
        }
        
        let startTimeFormatted = new Date(startTime).toLocaleString( );
        let endTimeFormatted = new Date(endTime).toLocaleString( );

        let durationFormatted =formatDuration(duration);
        const liInnerHTML = `<td>${site}</td>
        <td><a target="_blank" href='${url}'>${title}</a></td>
        <td>${startTimeFormatted}</td>
        <td>${endTimeFormatted}</td>
            <td>${durationFormatted}</td>
            <td>${wordChanges}</td>
        `;

        let tr = document.createElement("tr");
        tr.innerHTML = liInnerHTML;

        table.appendChild(tr);
    }
}


async function refresh(){
    let activities = await loadActivitiesFromStorage();
    activities = filterActivityByTimeRange(activities, timeRange.value);
    
    let pageSummaries = getPageSummaries(activities);
    renderPageSummaries(pageSummaries);
}

const init = async () => {


    await refresh();
};


init();
</script>

<template>
    <div class="pages">     
        <h1>{{ t('reportPageSummariesTitle') }}</h1>
        
        
        <table id="pageSummaries">
            <thead>
                <tr>
                    <th>{{ t('reportPageSummariesHeaderSite') }}</th>
                    <th>{{ t('reportPageSummariesHeaderTitle') }}</th>
                    <th>{{ t('reportPageSummariesHeaderStartReadTime') }}</th>
                    <th>{{ t('reportPageSummariesHeaderLastReadTime') }}</th>
                    <th>{{ t('reportPageSummariesHeaderDuration') }}</th>
                    <th>{{ t('reportPageSummariesHeaderVocabulary') }}</th>
                </tr>        
            </thead>
            <tbody id="pageSummariesBody">

            </tbody>
        </table>
    </div>
</template>

<style>



</style>
