<script setup>
import { ref, toRaw, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { useRoute } from 'vue-router'
import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {initializeOptionService} from '../../service/optionService.js';
import {loadActivitiesFromStorage} from '../../service/activityService.js';
import { formatDuration, filterActivityByTimeRange } from '../../report/report-utils.js'

Chart.register(...registerables);


var gChart;

const props = defineProps({
    
    
});

const timeRange = inject('timeRange');

const route = useRoute();
const t = chrome.i18n.getMessage;

watch(() => timeRange.value, async (newValue) => {
    await refresh();
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaySummaries(activities){
    let daySummaryMap = new Map();
    for(let activity of activities){
        let time = new Date(activity.endTime);
        
        let timeObject = new Date(time.getFullYear(), time.getMonth(), time.getDate());

        let timeFormatted = formatDate(timeObject);
        
        let key = timeFormatted;
        
        let summary = daySummaryMap.get(key);
        
        if(!summary){
            summary={
                time: timeObject,
                duration: 0,
                wordChanges: 0,
                vocabularySize: 0
            };

            daySummaryMap.set(key, summary);
        }

        summary.duration = summary.duration + activity.duration;      
        summary.wordChanges = summary.wordChanges + activity.wordChanges;
        summary.vocabularySize = activity.vocabularySize;//last
    }

    let array = Array.from(daySummaryMap, ([name, value]) => ({ ... value}));

    array.sort(function(a, b){return b.time - a.time;});
    //console.log('page summaries:' + JSON.stringify(array));
    return array;
}

function getVocabularyChartData(activities){
    /*
    let vocabularyArray = [];
    for(let activity of activities){
        let vocabulary = {
            x: activity.endTime,
            y: activity.vocabularySize,
        };
        vocabularyArray.push(vocabulary);
    }    
    //sort by time
    vocabularyArray.sort(function(a, b){return a.x - a.x});
    */

    
    let dayDurationSummaries = getDaySummaries(activities);

    let vocabularyArray = [];
    for(let summary of dayDurationSummaries){
        let item = {
            x: summary.time,
            y: summary.vocabularySize,
        };
        vocabularyArray.push(item);
    }   

    //duration
    let durationArray = [];
    for(let summary of dayDurationSummaries){
        let item = {
            x: summary.time,
            y: summary.duration / (60 * 60 * 1000),
        };
        durationArray.push(item);
    }    
    //sort by time
    durationArray.sort(function(a, b){return a.x - a.x});

    return {vocabulary: vocabularyArray, duration: durationArray};
}

function renderVocabularyChart(vocabularyChartData){
//console.log('vocabularyChartData:'+JSON.stringify(vocabularyChartData));

    const ctx = document.getElementById('vocabularyChart').getContext("2d");
    if(gChart){
        gChart.destroy();
    }
    gChart = new Chart(ctx, {
        type: 'line',
        options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    minUnit: 'day', // This ensures the smallest unit displayed is a minute
                }
            },
            'y-axis-line': {
                type: 'linear',
                position: 'left', // Position the bar chart's y-axis on the left
                title: {
                    display: true,
                    text: 'Vocabulary'
                }
            },
            'y-axis-bar': {
                type: 'linear',
                position: 'right', // Position the line chart's y-axis on the right
                beginAtZero: true,
                grid: {
                    drawOnChartArea: false, // Only draw the grid for the main y-axis
                },
                title: {
                    display: true,
                    text: 'Hours'
                }
            }
        }
        },
        data: {
            datasets: [
                {
                    yAxisID: 'y-axis-line',
                    label: chrome.i18n.getMessage('reportVocabularyChartLabel'),
                    data: vocabularyChartData.vocabulary,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                },
                {
                    yAxisID: 'y-axis-bar',
                    label: 'Reading Time',
                    data: vocabularyChartData.duration,
                    type: 'bar',
                    backgroundColor: [
                        
                        'rgba(54, 162, 235, 0.2)',
                        
                    ],
                    borderWidth: 1
                },

            ]
        }
    });
}

async function refresh(){
    let activities = await loadActivitiesFromStorage();
    activities = filterActivityByTimeRange(activities, timeRange.value);

    let vocabularyChartData = getVocabularyChartData(activities);
    
    renderVocabularyChart(vocabularyChartData);

}

const init = async () => {
    await initializeOptionService();
    
    await refresh();
};


init();
</script>

<template>
    <div class="vocabulary">     
        <h1>{{ t('reportVocabularyChartTitle') }}</h1>
        <canvas id="vocabularyChart"></canvas>
    </div>
</template>

<style>



</style>
