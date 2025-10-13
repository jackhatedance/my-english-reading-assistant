<script setup>
import { ref, provide } from 'vue';
import { loadSystemDictionariesToCache } from '../../dictionary/systemDictionary.js'
import Tabs from './Tabs.vue'

const t = chrome.i18n.getMessage;

const props = defineProps({
   query: Object
});

const timeRange = ref('last_360_days');

provide('query', props.query);
provide('timeRange', timeRange);

function changeTimeRange(){

}

const init = async () => {

    await loadSystemDictionariesToCache();
    
};

init();
</script>

<template>
    <div class="report-container">
        <Tabs></Tabs>

        <div class="time-range">
            <label>{{ t('report_filter_time_range') }}</label>
            <select data-testid="time-range" v-model="timeRange" @change="changeTimeRange" >
                <option value="all">{{ t('report_filter_time_range_option_all') }}</option>
                <option value="last_360_days">{{ t('report_filter_time_range_option_last_360_days') }}</option>
                <option value="last_30_days">{{ t('report_filter_time_range_option_last_30_days') }}</option>
                <option value="last_7_days">{{ t('report_filter_time_range_option_last_7_days') }}</option>
            </select> 
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
    
    text-align: right;
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