<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import {deleteAllReadingHistory} from '../../../service/activityService.js';
import {loadActivitiesFromStorage, saveActivities } from '../../../service/activityService.js';
import { saveTextAsFile } from '../../../html-utils.js';

const t = chrome.i18n.getMessage;
const enableReport = ref(false);

const file = ref();

async function onChange() {
  const report = {
    enabled: enableReport.value,
  };
  let newOptions = { report };
  await updateOptions(newOptions);
}

async function onDelete(){
  deleteAllReadingHistory();
}

function onImport() {
    
    const files = file.value.files;
    if(files.length == 0){
        alert('pick file first.');
        return;
    }
    
    const _file = files[0];

    var reader = new FileReader();
    reader.onload = function(e){
        let activities = JSON.parse(e.target.result);
        saveActivities(activities);
    }
    reader.readAsText(_file);

}

async function onExport() {
    let notes  = await loadActivitiesFromStorage();
    let json = JSON.stringify(notes);

    saveTextAsFile(json, 'activity', 'json');
}

function updateReport(reportOptions){
  enableReport.value = reportOptions.enabled;
}

const init = async () => {
  let options = await getOptions();
  updateReport(options.report);  
};

init();
</script>

<template>

  <div class="sections">
    <div class="section">
      <div class="label">

        <p>{{ t('optionsReportLabelDesc') }}</p>  
      </div>
      <div class="input">
        <div>
          <label>{{ t('optionsReportModeLabel') }}</label>
          <input type="checkbox" @change="onChange" v-model="enableReport">
        </div>
      </div>
      <div class="action">
        <button @click="onDelete">{{ t('optionsDeleteReadingHistoryAction') }}</button>
      </div>
    </div>
    

    <div class="section">
        <div class="label">
            {{ t('options_report_import_label_desc') }}
        </div>
        <div class="input">
            <input type="file" ref="file">
        </div>
        <div class="action">
            <button @click="onImport" >{{ t('options_report_import') }}</button>
        </div>
    </div>
    <div class="section">
        <div class="label">
            {{ t('options_report_export_label_desc') }}
        </div>

        <div class="input">
        </div>
        <div class="action">
            <button @click="onExport">{{ t('options_report_export') }}</button>
        </div>
    </div>
  </div>

</template>
