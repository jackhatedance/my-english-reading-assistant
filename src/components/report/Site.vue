<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import {initializeOptionService } from '../../service/optionService.js';
import { getAllSiteOptions} from '../../service/site-option-service.js';
import {loadActivitiesFromStorage} from '../../service/activityService.js';
import { formatDuration, formatVocabularyChange, filterActivityByTimeRange } from '../../report/report-utils.js'

const props = defineProps({
    
    
});
const timeRange = inject('timeRange');
const route = useRoute();
const t = chrome.i18n.getMessage;


watch(() => timeRange.value, async (newValue) => {
    await refresh();
});

function getSiteSummaries(activities){
    let summaryMap = new Map();
    for(let activity of activities){
        let site = activity.site;
        let summary = summaryMap.get(site);
        
        if(!summary){
            summary={
                site: site,
                startTime: activity.startTime,
                duration: 0,
                wordChanges: 0
            };

            summaryMap.set(site, summary);
        }

        summary.lastTime = activity.endTime;
        summary.duration = summary.duration + activity.duration;
        summary.wordChanges = summary.wordChanges + activity.wordChanges;
    }

    let array = Array.from(summaryMap, ([name, value]) => ({ ... value}));

    array.sort(function(a, b){return b.duration - a.duration});

    //console.log('site summaries:'+JSON.stringify(array));
    return array;
}

function renderSiteSummaries(summaries, allSiteOptions){
    let tableBody = document.getElementById('siteSummariesBody');
    tableBody.innerHTML='';

    for(let item of summaries){
        let {site, wordChanges, duration, startTime, lastTime} = item;

        let siteOptions = allSiteOptions[site];
        let category = siteOptions?.siteCategory;
        if(category == null){
            category = 'text';
        }
        
        let startTimeFormatted = new Date(startTime).toLocaleString( );
        let lastTimeFormatted = new Date(lastTime).toLocaleString( );

        let durationFormatted = formatDuration(duration);
        const liInnerHTML = `<td>${site}</td>
        <td>${category}</td>
        <td>${startTimeFormatted}</td>
        <td>${lastTimeFormatted}</td>
            <td>${durationFormatted}</td>
            <td>${ formatVocabularyChange(wordChanges) }</td>
        `;

        let tr = document.createElement("tr");
        tr.innerHTML = liInnerHTML;

        tableBody.appendChild(tr);
    }
}

async function refresh(){
    let activities = await loadActivitiesFromStorage();
    activities = filterActivityByTimeRange(activities, timeRange.value);
    let siteSummaries = getSiteSummaries(activities);
    let allSiteOptions = await getAllSiteOptions();
    renderSiteSummaries(siteSummaries, allSiteOptions);
}
const init = async () => {
    await initializeOptionService();
    await refresh();
};


init();
</script>

<template>
    <div class="sites">     
        <h1>{{ t('reportSiteSummariesTitle') }}</h1>
        <table id="siteSummaries">
            <thead>
                <tr>
                    <th>{{ t('reportSiteSummariesHeaderName') }}</th>
                    <th>{{ t('reportSiteSummariesHeaderCategory') }}</th>
                    <th>{{ t('reportSiteSummariesHeaderStartReadTime') }}</th>
                    <th>{{ t('reportSiteSummariesHeaderLastReadTime') }}</th>
                    <th>{{ t('reportSiteSummariesHeaderDuration') }}</th>
                    <th>{{ t('reportSiteSummariesHeaderVocabulary') }}</th>
                </tr>        
            </thead>
            <tbody id="siteSummariesBody">

            </tbody>
        </table>
    </div>
</template>

<style>



</style>
