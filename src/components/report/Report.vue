<script setup>
import { ref, provide, onMounted, watch } from 'vue';
import { loadSystemDictionariesToCache } from '../../dictionary/systemDictionary.js'
import Tabs from './Tabs.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const t = chrome.i18n.getMessage;

const props = defineProps({
   query: Object
});

const timePeriod = ref('last_30_days');
const timeRange = ref();

var periodStartTime, periodEndTime;

provide('query', props.query);
provide('timeRange', timeRange);


watch(timeRange, (newValue) => {
    if(newValue && newValue[0] == periodStartTime && newValue[1] == periodEndTime){
        //do nothing
    }else {
        timePeriod.value = 'custom';
    }
});

function changeTimePeriod(){
    let period = timePeriod.value;
    if(period==='custom'){
        periodStartTime = null;
        periodEndTime = null;
        return;   
    }

    let now = new Date();
    let beginOfToday = getBeginOfDate(now);

    let startTime, endTime;
    
    if(period==='all'){
        startTime = new Date(1970, 0, 1);
    } else if(period==='this_year'){
        startTime = new Date(beginOfToday.getFullYear(), 0, 1);
    } else if(period==='this_month'){
        startTime = new Date(beginOfToday.getFullYear(), beginOfToday.getMonth(), 1);
    } else if(period==='this_week'){
        startTime = getDaysAgo(beginOfToday, -beginOfToday.getDay());
    } else if(period==='last_7_days'){
        startTime = getDaysAgo(beginOfToday, -7+1);
    } else if(period==='last_30_days'){
        startTime = getDaysAgo(beginOfToday, -30+1);
    } else if(period==='last_360_days'){
        startTime = getDaysAgo(beginOfToday, -360+1);
    } else if(period==='last_24_hours'){
        startTime = getHoursOffset(now, -24);
    } else if(period==='last_60_minutes'){
        startTime = getMinutesOffset(now, -60);
    } else if(period==='last_15_minutes'){
        startTime = getMinutesOffset(now, -15);
    }

    endTime = getDaysAgo(now, 1);

    periodStartTime = startTime;
    periodEndTime = endTime;

    timeRange.value = [startTime, endTime];
}

function getDaysAgo(dt1, daysOffset){
    let dt2 = new Date(dt1);
    dt2.setDate(dt1.getDate() + daysOffset);
    
    return dt2;
}

function getHoursOffset(dt1, offset){
    let dt2 = new Date(dt1);
    dt2.setHours(dt1.getHours() + offset);
    
    return dt2;
}

function getMinutesOffset(dt1, offset){
    let dt2 = new Date(dt1);
    dt2.setMinutes(dt1.getMinutes() + offset);
    
    return dt2;
}

function getBeginOfDate(dt){
    let dt2 = new Date(dt);

    dt2.setHours(0);
    dt2.setMinutes(0);
    dt2.setSeconds(0);
    dt2.setMilliseconds(0);

    return dt2;
}

onMounted(() => {
  
});

const init = async () => {

    await loadSystemDictionariesToCache();

   changeTimePeriod();
};

init();
</script>

<template>
    <div class="report-container">
        <Tabs></Tabs>

        <div class="time-range">
            <label for="time-range">{{ t('report_filter_time_range') }}</label>
            <select id="time-range" data-testid="time-range" v-model="timePeriod" @change="changeTimePeriod" >
                <option value="all">{{ t('report_filter_time_range_option_all') }}</option>
                <option value="last_360_days">{{ t('report_filter_time_range_option_last_360_days') }}</option>
                <option value="last_30_days">{{ t('report_filter_time_range_option_last_30_days') }}</option>
                <option value="last_7_days">{{ t('report_filter_time_range_option_last_7_days') }}</option>
                <option value="last_24_hours">{{ t('report_filter_time_range_option_last_24_hours') }}</option>
                <option value="last_60_minutes">{{ t('report_filter_time_range_option_last_60_minutes') }}</option>
                <option value="last_15_minutes">{{ t('report_filter_time_range_option_last_15_minutes') }}</option>
                <option value="custom">{{ t('report_filter_time_range_option_custom') }}</option>
            </select> 

            <VueDatePicker v-model="timeRange" range :clearable="false"/>
        </div>

        <div class="report">
            <RouterView />
        </div>
        
    </div>
</template>
<style>
body {
    
    margin: 0;
    
}

.report {
    text-align: center;
}

.app {
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  text-align: left;
  padding: 20px;
  margin: 10px;
}

.time-range {
    * {
        margin: 5px;
    }
    padding-right: 10px;
    
    text-align: right;

    .dp__main{
        display: inline-block;
        width: 360px;
        .dp__input_icon{
            top: 40%;
        }
    }
}

.report-container {
    height: 100%;
}


table {
  border-collapse: collapse;
  width: 100%;
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 14px;
  text-align: left;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  margin: auto;
  margin-top: 50px;
  margin-bottom: 50px;
} 
table th {
  background-color: #9da9be;
  color: #fff;
  font-weight: bold;
  padding: 10px;
  letter-spacing: 1px;
  border-top: 1px solid #fff;
  border-bottom: 1px solid #ccc;
}
table tr:nth-child(even) td {
  background-color: #f2f2f2;
}

table tr:hover td {
  background-color: #ffedcc;
}
table td {
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
}

</style>