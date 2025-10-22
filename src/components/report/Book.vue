<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import { formatDuration, formatVocabularyChange, filterActivityByTimeRange } from '../../report/report-utils.js'
import {initializeOptionService} from '../../service/optionService.js';
import {loadActivitiesFromStorage} from '../../service/activityService.js';
import { getAllBooks, getBook, searchBookByUrl } from '../../service/bookService.js'

const props = defineProps({
    
    
});

const timeRange = inject('timeRange');

const route = useRoute();
const t = chrome.i18n.getMessage;

watch(timeRange, async (newValue) => {
    await refresh();
});

async function getBookSummaries(activities){
    let books = await getAllBooks();

    let bookSummaryMap = new Map();
    for(let activity of activities){
        let site = activity.site;
        let url = activity.url;
        
        //always search by latest url rules
        let book = searchBookByUrl(url, books);
        if(!book){
            continue;
        }

        let isbn = book.isbn;
        let key = isbn;
        
        let summary = bookSummaryMap.get(key);
                
        if(!summary){
            summary={
                site: site,
                isbn: isbn,
                startTime: activity.startTime,
                endTime: 0,
                duration: 0,
                wordCountMap: new Map(),//key is url
                wordChanges: 0
            };

            bookSummaryMap.set(key, summary);
        }

        summary.startTime = Math.min(activity.startTime, summary.startTime);
        summary.endTime = Math.max(activity.endTime, summary.endTime);
        summary.duration = summary.duration + activity.duration;      
        
        summary.wordCountMap.set(url, activity.totalWordCount);

        summary.wordChanges = summary.wordChanges + activity.wordChanges;
    }

    let array = Array.from(bookSummaryMap, ([name, value]) => ({ ... value}));

    for(let item of array) {
        let totalWordCount = 0;
        let pageCount = 0;
        for(let wordCount of item.wordCountMap.values()){
            totalWordCount += wordCount;
            pageCount++;
        }

        let book = await getBook(item.isbn);
        item.title = book.title;
        item.pageCount = pageCount;
        item.totalWordCount = totalWordCount;
    }


    array.sort(function(a, b){return b.endTime - a.endTime;});
    //console.log('book summaries:' + JSON.stringify(array));
    return array;
}


function renderBookSummaries(bookSummaries){
    let table = document.getElementById('bookSummariesBody');
    table.innerHTML = '';

    for(let item of bookSummaries){
        let {site, title, isbn, wordChanges, pageCount, totalWordCount, duration, startTime, endTime} = item;

                
        let startTimeFormatted = new Date(startTime).toLocaleString( );
        let endTimeFormatted = new Date(endTime).toLocaleString( );

        let durationFormatted =formatDuration(duration);

        let durationInMinutes = duration / (60 * 1000);
        let speed =  (totalWordCount / durationInMinutes).toFixed(0);

        const liInnerHTML = `<td>${site}</td>
        <td>${title}</td>
        <td>${startTimeFormatted}</td>
        <td>${endTimeFormatted}</td>
            <td>${durationFormatted}</td>
            <td>${pageCount}</td>
            <td>${totalWordCount}</td>
            <td>${speed}</td>
            <td>${ formatVocabularyChange(wordChanges) }</td>
        `;

        let tr = document.createElement("tr");
        tr.innerHTML = liInnerHTML;

        table.appendChild(tr);
    }
}


async function refresh(){
    let activities = await loadActivitiesFromStorage();
    activities = filterActivityByTimeRange(activities, timeRange.value);
    
    let bookSummaries = await getBookSummaries(activities);
    renderBookSummaries(bookSummaries);
}

const init = async () => {

    await refresh();
};


init();
</script>

<template>
    <div class="books">     
        <h1>{{ t('reportBookSummariesTitle') }}</h1>
        <p>{{ t('reportBookSummariesTitleDesc') }}</p>
        
        <table id="bookSummaries">
            <thead>
                <tr>
                    <th>{{ t('reportBookSummariesHeaderSite') }}</th>
                    <th>{{ t('reportBookSummariesHeaderTitle') }}</th>
                    <th>{{ t('reportBookSummariesHeaderStartReadTime') }}</th>
                    <th>{{ t('reportBookSummariesHeaderLastReadTime') }}</th>
                    <th>{{ t('reportBookSummariesHeaderDuration') }}</th>
                    <th>{{ t('reportBookSummariesHeaderPages') }}</th>
                    <th>{{ t('reportBookSummariesHeaderWords') }}</th>
                    <th>{{ t('reportBookSummariesHeaderSpeed') }}</th>
                    <th>{{ t('reportBookSummariesHeaderVocabulary') }}</th>
                </tr>        
            </thead>
            <tbody id="bookSummariesBody">

            </tbody>
        </table>
    </div>
</template>

<style>



</style>
